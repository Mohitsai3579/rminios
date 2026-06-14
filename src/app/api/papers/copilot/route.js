import { createClient } from '@/lib/supabase/server';
import { generateText } from '@/lib/gemini';
import { SYSTEM_PROMPTS } from '@/lib/prompts';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { instruction, currentContent, workspaceId, citationStyle } = await request.json();
    const supabase = await createClient();

    // Optionally get context from papers for citation-related requests
    let paperContext = '';
    if (instruction.toLowerCase().includes('citation') || instruction.toLowerCase().includes('reference')) {
      const { data: files } = await supabase
        .from('files')
        .select('name, extracted_text')
        .eq('workspace_id', workspaceId)
        .eq('processing_status', 'ready')
        .limit(5);

      paperContext = (files || []).map(f => `"${f.name}": ${(f.extracted_text || '').slice(0, 1000)}`).join('\n');
    }

    const prompt = `INSTRUCTION: ${instruction}

CURRENT TEXT:
${currentContent}

${paperContext ? `AVAILABLE PAPERS FOR CITATIONS:\n${paperContext}\n` : ''}
${citationStyle ? `Use ${citationStyle.toUpperCase()} citation format.` : ''}

Return ONLY the improved text. Do not add any explanations, headers, or meta-commentary.`;

    const content = await generateText(prompt, SYSTEM_PROMPTS.copilot);

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Copilot error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
