import { createClient } from '@/lib/supabase/server';
import { generateText, safeParseJSON } from '@/lib/gemini';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { text, workspaceId } = await request.json();
    if (!text) return NextResponse.json({ error: 'Text required' }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const prompt = `Perform a comprehensive academic integrity and writing quality analysis on the following text:

"${text.substring(0, 15000)}"

Return a JSON object containing:
1. "overall_score": 0-100 overall quality and integrity score
2. "clarity_score": 0-100 how clear and readable the text is
3. "tone_score": 0-100 how well it adheres to formal academic tone
4. "citation_score": 0-100 based on presence and format of citations (if applicable)
5. "originality_score": 0-100 an estimate of how original the phrasing is
6. "issues": Array of objects [{"severity": "high/medium/low", "message": "Description of the issue"}]. Max 5 issues.
7. "suggestions": Array of 3-5 strings with actionable advice to improve the text.

Format the response as pure JSON without markdown block wrappers.`;

    const systemPrompt = "You are an expert Academic Reviewer and Editor. Return only valid JSON.";
    const result = await generateText(prompt, systemPrompt);
    
    const data = safeParseJSON(result, {
      overall_score: 0,
      clarity_score: 0,
      tone_score: 0,
      citation_score: 0,
      originality_score: 0,
      issues: [],
      suggestions: ['Could not complete analysis. Please try again.'],
    });

    try {
      await supabase.from('usage_tracking').insert({ user_id: user.id, action: 'analyze_integrity', resource_type: 'integrity', tokens_used: Math.ceil(result.length / 4) });
    } catch (trackErr) {
      // Non-critical
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Integrity analysis error:', error);
    return NextResponse.json({ error: error.message || 'Integrity analysis failed' }, { status: 500 });
  }
}
