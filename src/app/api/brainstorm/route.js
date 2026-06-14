import { createClient } from '@/lib/supabase/server';
import { generateText, safeParseJSON } from '@/lib/gemini';
import { SYSTEM_PROMPTS } from '@/lib/prompts';
import { NextResponse } from 'next/server';
import { aiRateLimiter } from '@/lib/rate-limit';

export async function POST(request) {
  try {
    const { workspaceId, selectedFileIds } = await request.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check rate limit using User ID (or IP if unauthenticated, but this requires auth)
    if (user && !aiRateLimiter.check(user.id)) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please wait a minute before requesting another brainstorm.' }, { status: 429 });
    }

    // Get selected files in workspace
    let query = supabase
      .from('files')
      .select('id, name, extracted_text')
      .eq('workspace_id', workspaceId)
      .eq('processing_status', 'ready');
      
    if (selectedFileIds && selectedFileIds.length > 0) {
      query = query.in('id', selectedFileIds);
    }
      
    const { data: files } = await query;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No processed papers found. Upload and process papers first.' }, { status: 400 });
    }

    // Build context from all papers
    const paperSummaries = files.map(f => {
      const text = f.extracted_text || '';
      return `Paper: "${f.name}"\nContent preview: ${text.slice(0, 2000)}`;
    }).join('\n\n===\n\n');

    const ideasPrompt = `Analyze these ${files.length} research papers and generate 5-8 creative research ideas.

${paperSummaries}

Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "ideas": [
    {"title": "...", "description": "...", "novelty_score": 8, "difficulty": "intermediate", "skills": ["..."], "impact": "..."}
  ],
  "gaps": [
    {"area": "...", "description": "...", "opportunity": "...", "evidence": "..."}
  ],
  "themes": ["theme1", "theme2"],
  "weaknesses": ["weakness1", "weakness2"]
}`;

    const result = await generateText(ideasPrompt, SYSTEM_PROMPTS.brainstorm);

    const parsed = safeParseJSON(result, { ideas: [], gaps: [], themes: [], weaknesses: [] });

    // Save brainstorm
    const { data: brainstorm } = await supabase.from('brainstorms').insert({
      workspace_id: workspaceId,
      user_id: user.id,
      title: `Brainstorm - ${new Date().toLocaleDateString()}`,
      ideas: parsed.ideas || [],
      gaps: parsed.gaps || [],
      themes: parsed.themes || [],
      status: 'complete',
    }).select().single();

    return NextResponse.json(brainstorm);
  } catch (error) {
    console.error('Brainstorm error:', error);
    return NextResponse.json({ error: error.message || 'Brainstorm generation failed' }, { status: 500 });
  }
}
