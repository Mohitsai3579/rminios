import { createClient } from '@/lib/supabase/server';
import { generateText } from '@/lib/gemini';
import { SYSTEM_PROMPTS, SECTION_TEMPLATES } from '@/lib/prompts';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { workspaceId, sectionType, sectionTitle, paperTitle, citationStyle, paperIdea, paperFormat } = await request.json();
    const supabase = await createClient();

    // Get context from workspace papers
    const { data: files } = await supabase
      .from('files')
      .select('name, extracted_text')
      .eq('workspace_id', workspaceId)
      .eq('processing_status', 'ready')
      .limit(10);

    const context = (files || []).map(f => {
      const text = f.extracted_text || '';
      return `"${f.name}": ${text.slice(0, 1500)}`;
    }).join('\n\n');

    let template = SECTION_TEMPLATES[sectionType];
    
    // If standard template doesn't exist, use the dynamic section template
    if (!template) {
      template = SECTION_TEMPLATES.dynamic_section;
    }

    const prompt = template
      .replace(/{title}/g, paperTitle || 'Research Paper')
      .replace(/{topic}/g, paperTitle || 'the research topic')
      .replace(/{sectionTitle}/g, sectionTitle || sectionType)
      .replace(/{context}/g, context || 'No papers uploaded yet.')
      .replace(/{formatInstructions}/g, paperFormat || 'Follow standard academic formatting.')
      + `\n\nUse ${citationStyle.toUpperCase()} citation format.`
      + (paperIdea ? `\n\nCORE IDEA TO IMPLEMENT:\n${paperIdea}` : '');

    const content = await generateText(prompt, SYSTEM_PROMPTS.paper_section);

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Generate section error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
