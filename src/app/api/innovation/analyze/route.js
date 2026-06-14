export const maxDuration = 60;

import { createClient } from '@/lib/supabase/server';
import { generateText, safeParseJSON } from '@/lib/gemini';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { workspaceId } = await request.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: ws } = await supabase.from('workspaces').select('name').eq('id', workspaceId).single();
    const { data: files } = await supabase.from('files').select('name, extracted_text').eq('workspace_id', workspaceId).limit(3);
    
    let context = `Workspace: ${ws?.name || 'Research Workspace'}\n\n`;
    files?.forEach(f => context += `Source ${f.name}:\n${(f.extracted_text || '').substring(0, 1000)}...\n\n`);

    const prompt = `Analyze this research context and generate commercialization, patent, and startup opportunities:
${context}

Return a JSON object with:
1. "market_score": 0-100 overall commercial viability score
2. "summary": "1 paragraph overview of the commercial potential"
3. "patent_landscape": "1 paragraph summarizing existing IP landscape possibilities"
4. "potential_patents": [{"title": "Patent concept", "description": "What to patent"}] (max 3)
5. "startup_ideas": [{"name": "Startup Name", "pitch": "Elevator pitch", "business_model": "SaaS, Hardware, etc.", "target_audience": "Who pays for this"}] (max 3)
6. "funding_opportunities": [{"source": "Grant type or VC focus", "strategy": "How to position it"}] (max 3)

Return pure JSON only.`;

    const systemPrompt = "You are an expert Technology Transfer Officer and Venture Capitalist. Return only valid JSON.";
    const result = await generateText(prompt, systemPrompt);
    
    const data = safeParseJSON(result, {
      market_score: 0,
      summary: 'Analysis could not be completed. Please try again.',
      patent_landscape: '',
      potential_patents: [],
      startup_ideas: [],
      funding_opportunities: [],
    });

    try {
      await supabase.from('usage_tracking').insert({ user_id: user.id, action: 'analyze_innovation', resource_type: 'innovation', tokens_used: Math.ceil(result.length / 4) });
    } catch (trackErr) {
      // Usage tracking failure is non-critical
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Innovation analysis error:', error);
    return NextResponse.json({ error: error.message || 'Innovation analysis failed' }, { status: 500 });
  }
}

