import { createClient } from '@/lib/supabase/server';
import { generateText, generateTextStream } from '@/lib/gemini';
import { NextResponse } from 'next/server';

const ROLE_PROMPTS = {
  teacher: 'You are a patient, encouraging teacher. Explain concepts clearly with examples. Adapt to the user\'s level.',
  mentor: 'You are an experienced research mentor. Guide the user through research methodology, help them think critically.',
  reviewer: 'You are a constructive journal reviewer. Evaluate work fairly and provide actionable improvement suggestions.',
  brainstorm: 'You are a creative brainstorming partner. Generate innovative ideas and help explore unconventional approaches.',
  writer: 'You are an academic writing assistant. Help improve clarity, structure, and academic tone.',
  coach: 'You are a presentation coach. Help prepare for talks, vivas, and defend research clearly.',
};

export async function POST(request) {
  try {
    const { message, workspaceId, role = 'mentor', stream = false } = await request.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get workspace context
    let context = '';
    if (workspaceId) {
      const { data: ws } = await supabase.from('workspaces').select('name, description').eq('id', workspaceId).single();
      const { data: files } = await supabase.from('files').select('name, extracted_text').eq('workspace_id', workspaceId).eq('processing_status', 'ready').limit(3);
      context = `Workspace: "${ws?.name}" - ${ws?.description || ''}\n`;
      if (files?.length) context += `Papers: ${files.map(f => `"${f.name}": ${(f.extracted_text || '').slice(0, 500)}`).join('\n')}`;
    }

    // Get user profile for personalization
    const { data: profile } = await supabase.from('profiles').select('role, research_interests').eq('id', user.id).single();

    const systemPrompt = `${ROLE_PROMPTS[role] || ROLE_PROMPTS.mentor}\n\nUser role: ${profile?.role || 'student'}\nResearch interests: ${(profile?.research_interests || []).join(', ') || 'not specified'}\n\n${context ? `Context:\n${context}` : ''}`;

    if (stream) {
      const streamResult = await generateTextStream(message, systemPrompt);
      const readable = new ReadableStream({
        async start(controller) {
          try { for await (const chunk of streamResult) { const t = chunk.text(); if (t) controller.enqueue(new TextEncoder().encode(t)); } controller.close(); } catch (e) { controller.error(e); }
        },
      });
      return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }

    const result = await generateText(message, systemPrompt);

    // Track usage
    await supabase.from('usage_tracking').insert({ user_id: user.id, action: 'assistant_chat', resource_type: 'assistant', tokens_used: Math.ceil(result.length / 4) });

    return NextResponse.json({ response: result });
  } catch (error) {
    console.error('Assistant error:', error);
    return new Response(error.message, { status: 500 });
  }
}
