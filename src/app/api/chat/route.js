import { createClient } from '@/lib/supabase/server';
import { generateEmbedding, generateTextStream } from '@/lib/gemini';
import { buildRagPrompt } from '@/lib/rag';
import { SYSTEM_PROMPTS } from '@/lib/prompts';
import { aiRateLimiter } from '@/lib/rate-limit';

export async function POST(request) {
  try {
    const { message, workspaceId, conversationId, history } = await request.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check rate limit
    if (user && !aiRateLimiter.check(user.id)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please wait.' }), { status: 429, headers: { 'Content-Type': 'application/json' } });
    }

    // Try to do hybrid vector search, with LLM Reranking
    let context = '';
    try {
      const queryEmbedding = await generateEmbedding(message);

      if (queryEmbedding) {
        // Try hybrid search first, fallback to dense search
        let chunks = [];
        const { data: hybridChunks, error: hybridErr } = await supabase.rpc('hybrid_match_chunks', {
          query_text: message,
          query_embedding: queryEmbedding,
          match_workspace_id: workspaceId,
          match_count: 15, // Get more for reranking
        });

        if (!hybridErr && hybridChunks) {
          chunks = hybridChunks;
        } else {
          // Fallback if SQL migration hasn't been run
          const { data: denseChunks } = await supabase.rpc('match_chunks', {
            query_embedding: queryEmbedding,
            match_workspace_id: workspaceId,
            match_threshold: 0.1,
            match_count: 15,
          });
          if (denseChunks) chunks = denseChunks;
        }

        if (chunks && chunks.length > 0) {
          // LLM Reranking Layer
          const { generateText, safeParseJSON } = await import('@/lib/gemini');
          
          const rerankPrompt = `You are a Relevance Reranker. Given a user query and a list of document chunks, determine the top 5 most relevant chunks to answer the query.
Query: "${message}"

Chunks:
${chunks.map((c, i) => `[ID: ${i}] ${c.content.substring(0, 300)}...`).join('\n\n')}

Return ONLY a JSON array of the top 5 most relevant chunk IDs (e.g., [2, 0, 4, 1, 7]). Return an empty array [] if none are relevant.`;
          
          const rerankResponse = await generateText(rerankPrompt);
          const topIds = safeParseJSON(rerankResponse, [0, 1, 2, 3, 4]); // fallback to top 5
          
          const rerankedChunks = (Array.isArray(topIds) ? topIds : [0, 1, 2, 3, 4])
            .map(id => chunks[id])
            .filter(c => c !== undefined)
            .slice(0, 5); // strict cutoff

          context = rerankedChunks.map((c, i) => {
            return `[Citation Source: ${c.file_name || 'Document'}, Page: ${c.page_number || 1}]:\n${c.content}`;
          }).join('\n\n---\n\n');
        }
      }
    } catch (searchErr) {
      console.error('Vector search failed, continuing without context:', searchErr.message);
    }

    // If no vector context, try to get raw paper text as fallback
    if (!context) {
      try {
        const { data: files } = await supabase
          .from('files')
          .select('name, extracted_text')
          .eq('workspace_id', workspaceId)
          .eq('processing_status', 'ready')
          .limit(3);

        if (files && files.length > 0) {
          context = files.map((f, i) => {
            const preview = (f.extracted_text || '').slice(0, 2000);
            return `[Source ${i + 1} - ${f.name}]:\n${preview}`;
          }).join('\n\n---\n\n');
        }
      } catch (fallbackErr) {
        console.error('Fallback context fetch failed:', fallbackErr.message);
      }
    }

    // Build prompt
    const prompt = buildRagPrompt(context, message, history || []);

    // Stream response
    const stream = await generateTextStream(prompt, SYSTEM_PROMPTS.research_assistant);

    // Create ReadableStream for response
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response('Sorry, I encountered an error. Please try again.', { status: 500 });
  }
}
