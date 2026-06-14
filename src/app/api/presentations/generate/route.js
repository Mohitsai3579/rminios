export const maxDuration = 60;

import { createClient } from '@/lib/supabase/server';
import { generateText, safeParseJSON } from '@/lib/gemini';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { workspaceId, paperId, type } = await request.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let context = "Context from workspace:\n";
    let title = "Generated Presentation";

    if (paperId) {
      const { data: paper } = await supabase.from('papers').select('title, sections').eq('id', paperId).single();
      if (paper) {
        title = paper.title;
        context += `Paper Title: ${paper.title}\n`;
        (paper.sections || []).forEach(s => {
          context += `Section ${s.title}:\n${s.content.substring(0, 500)}...\n\n`;
        });
      }
    } else {
       const { data: ws } = await supabase.from('workspaces').select('name').eq('id', workspaceId).single();
       if (ws) title = `Presentation on ${ws.name}`;
       const { data: files } = await supabase.from('files').select('name, extracted_text').eq('workspace_id', workspaceId).limit(2);
       if (files) files.forEach(f => context += `Source ${f.name}:\n${f.extracted_text?.substring(0, 800)}...\n\n`);
    }

    let prompt = "";
    if (type === 'slides' || type === 'poster') {
      prompt = `Create a presentation structure based on this content:
${context}

Return a JSON object with:
1. "title": "The presentation title"
2. "slides": Array of objects: [{"title": "Slide Title", "points": ["Bullet 1", "Bullet 2", "Bullet 3"]}] (generate 5-8 slides covering Intro, Methods, Results, Conclusion)
3. "speaker_notes": Array of strings, one paragraph per slide, providing a script for the presenter.`;
    } else if (type === 'viva') {
      prompt = `Create a Viva / Thesis Defense preparation guide based on this content:
${context}

Return a JSON object with:
1. "title": "Viva Preparation Guide"
2. "viva_questions": Array of objects: [{"question": "A challenging question the committee might ask", "answer": "How the student should effectively respond"}] (generate 8-10 questions ranging from basic to critical methodology challenges).`;
    }

    const systemPrompt = "You are an expert academic presentation coach. Return only valid JSON without markdown block wrappers.";
    const result = await generateText(prompt, systemPrompt);
    
    const data = safeParseJSON(result, {
      title: title,
      slides: [{ title: 'Could not generate', points: ['Please try again'] }],
      speaker_notes: [],
      viva_questions: [],
    });

    const insertData = {
      workspace_id: workspaceId,
      user_id: user.id,
      paper_id: paperId || null,
      title: data.title || title,
      presentation_type: type,
      slides: data.slides || [],
      speaker_notes: data.speaker_notes || [],
      viva_questions: data.viva_questions || []
    };

    const { data: newPres } = await supabase.from('presentations').insert(insertData).select().single();

    try {
      await supabase.from('usage_tracking').insert({ user_id: user.id, action: 'generate_presentation', resource_type: 'presentation', tokens_used: Math.ceil(result.length / 4) });
    } catch (trackErr) { /* non-critical */ }

    return NextResponse.json(newPres);
  } catch (error) {
    console.error('Presentation generation error:', error);
    return NextResponse.json({ error: error.message || 'Presentation generation failed' }, { status: 500 });
  }
}

