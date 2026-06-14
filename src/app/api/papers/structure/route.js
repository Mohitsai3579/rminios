export const maxDuration = 60;

import { generateText } from '@/lib/gemini';
import { SYSTEM_PROMPTS } from '@/lib/prompts';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { paperIdea, paperFormat } = await request.json();

    const prompt = `
Please generate a structured JSON array of sections for this paper.
${paperIdea ? `PAPER IDEA:\n${paperIdea}\n` : ''}
${paperFormat ? `FORMATTING GUIDELINES & TEMPLATE:\n${paperFormat}\n` : ''}

Respond ONLY with a valid JSON array. Do not include markdown code blocks.`;

    let content = await generateText(prompt, SYSTEM_PROMPTS.paper_structure);
    
    // Clean up potential markdown formatting from Gemini
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
      const parsedSections = JSON.parse(content);
      // Ensure all items have necessary fields
      const formattedSections = parsedSections.map((s, i) => ({
        id: `sec-${i}`,
        type: s.type || 'custom',
        title: s.title || `Section ${i+1}`,
        content: '',
        order: i
      }));
      return NextResponse.json({ sections: formattedSections });
    } catch (e) {
      console.error('Failed to parse Gemini JSON:', content);
      throw new Error('AI returned invalid JSON structure.');
    }

  } catch (error) {
    console.error('Generate structure error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
