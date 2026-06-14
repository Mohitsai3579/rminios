import { createClient } from '@/lib/supabase/server';
import { generateText, safeParseJSON } from '@/lib/gemini';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { experimentId, workspaceId, title, hypothesis } = await request.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const prompt = `Design a research experiment methodology based on:
Title: ${title}
Hypothesis: ${hypothesis || 'Not provided'}

Return a JSON object with:
1. "methodology": "Detailed paragraph explaining the experimental setup and procedure"
2. "variables": {"independent": ["v1"], "dependent": ["v2"], "control": ["v3"]}
3. "metrics": {"Metric1Name": "Expected target/unit", "Metric2Name": "Expected target/unit"} (e.g., {"Accuracy": "95%", "Latency": "<50ms"})

Format the response as pure JSON without markdown block wrappers.`;

    const systemPrompt = "You are an expert Research Scientist designing robust experiments. Return only valid JSON.";
    const result = await generateText(prompt, systemPrompt);
    
    const data = safeParseJSON(result, {
      methodology: 'Could not generate methodology. Please try again.',
      variables: { independent: [], dependent: [], control: [] },
      metrics: {},
    });

    await supabase.from('experiments').update({
      methodology: data.methodology,
      variables: data.variables,
      metrics: data.metrics,
      updated_at: new Date().toISOString()
    }).eq('id', experimentId);

    try {
      await supabase.from('usage_tracking').insert({ user_id: user.id, action: 'generate_experiment', resource_type: 'experiment', tokens_used: Math.ceil(result.length / 4) });
    } catch (trackErr) {
      // Non-critical
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Experiment generation error:', error);
    return NextResponse.json({ error: error.message || 'Experiment generation failed' }, { status: 500 });
  }
}
