/**
 * RAG (Retrieval-Augmented Generation) pipeline
 * Handles vector search, re-ranking, and context-augmented AI responses
 */

import { generateEmbedding } from './gemini';

/**
 * Search for similar chunks in a workspace using vector similarity
 */
export async function searchSimilarChunks(supabase, workspaceId, query, topK = 10) {
  const queryEmbedding = await generateEmbedding(query);

  if (!queryEmbedding) {
    console.error('Could not generate query embedding');
    return [];
  }

  const { data, error } = await supabase.rpc('match_chunks', {
    query_embedding: queryEmbedding,
    match_workspace_id: workspaceId,
    match_threshold: 0.25, // Lower threshold = more results to re-rank
    match_count: topK,
  });

  if (error) {
    console.error('Vector search error:', error);
    return [];
  }

  return data || [];
}

/**
 * Re-rank chunks by keyword relevance to boost precision.
 * Combines vector similarity with keyword matching.
 */
export function rerankChunks(chunks, query) {
  if (!chunks.length || !query) return chunks;

  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

  return chunks
    .map(chunk => {
      const content = (chunk.content || '').toLowerCase();
      let keywordScore = 0;

      for (const term of queryTerms) {
        // Count occurrences of each query term
        const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = (content.match(regex) || []).length;
        keywordScore += matches;
      }

      // Normalize keyword score (0-1 range)
      const normalizedKeyword = Math.min(keywordScore / (queryTerms.length * 3), 1);
      
      // Combined score: 60% vector similarity + 40% keyword relevance
      const combinedScore = (chunk.similarity || 0.5) * 0.6 + normalizedKeyword * 0.4;

      return { ...chunk, combinedScore, keywordScore };
    })
    .sort((a, b) => b.combinedScore - a.combinedScore)
    .slice(0, 8); // Return top 8 after re-ranking
}

/**
 * Build context string from matched chunks
 */
export function buildContext(chunks) {
  if (!chunks.length) return '';

  return chunks
    .map((chunk, i) => {
      const source = chunk.file_name || `Source ${i + 1}`;
      const page = chunk.page_number ? ` (Page ${chunk.page_number})` : '';
      return `[${source}${page}]:\n${chunk.content}`;
    })
    .join('\n\n---\n\n');
}

/**
 * Build the RAG prompt with context and user question
 */
export function buildRagPrompt(context, question, conversationHistory = []) {
  const historyText = conversationHistory
    .slice(-6) // Last 6 messages for context
    .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');

  return `You are RMinios, an AI research assistant. Answer the user's question based on the research papers and documents provided below.

RULES:
- Base your answers on the provided context from the user's uploaded papers
- When referencing specific papers, mention the source name
- If the context doesn't contain relevant information, say so honestly but still try to give a helpful general answer
- Use academic language when appropriate
- Format your response with markdown for readability
- Include specific quotes or data points from the papers when relevant

CONTEXT FROM UPLOADED PAPERS:
${context || 'No relevant context found in uploaded papers. Answer based on your general knowledge.'}

${historyText ? `CONVERSATION HISTORY:\n${historyText}\n` : ''}
USER QUESTION: ${question}`;
}

/**
 * Format source references for display
 */
export function formatSources(chunks) {
  const uniqueSources = new Map();

  chunks.forEach((chunk) => {
    const key = chunk.file_id || chunk.file_name;
    if (!uniqueSources.has(key)) {
      uniqueSources.set(key, {
        file_id: chunk.file_id,
        file_name: chunk.file_name,
        pages: new Set(),
        relevance: chunk.similarity,
      });
    }
    if (chunk.page_number) {
      uniqueSources.get(key).pages.add(chunk.page_number);
    }
  });

  return Array.from(uniqueSources.values()).map((source) => ({
    ...source,
    pages: Array.from(source.pages).sort((a, b) => a - b),
  }));
}
