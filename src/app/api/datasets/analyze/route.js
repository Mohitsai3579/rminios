export const maxDuration = 60;

import { createClient } from '@/lib/supabase/server';
import { generateText } from '@/lib/gemini';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { datasetId, workspaceId } = await request.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: dataset } = await supabase.from('datasets').select('*').eq('id', datasetId).single();
    if (!dataset) return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });

    // In a real app, we'd fetch the file from storage and parse it here.
    // For this prototype, we'll simulate an analysis based on metadata
    const prompt = `Analyze a research dataset with the following metadata:
Name: ${dataset.name}
Format: ${dataset.format}
Size: ${dataset.size_bytes} bytes

Generate a JSON response containing:
1. "summary": A brief paragraph describing what this dataset likely contains and how it could be used in research.
2. "quality_score": An estimated score (0-100) based on typical data quality for this format.
3. "recommendations": Array of 3 specific analysis techniques to apply to this data.
4. "potential_issues": Array of 2 common data cleaning steps needed for this type of data.

Return ONLY valid JSON.`;

    const systemPrompt = "You are an expert data scientist and research analyst. Return only JSON.";
    let result = await generateText(prompt, systemPrompt);
    
    // Clean up markdown formatting if present
    result = result.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const analysis = JSON.parse(result);

    await supabase.from('datasets').update({ 
      analysis, 
      quality_score: analysis.quality_score 
    }).eq('id', datasetId);

    // Track usage
    await supabase.from('usage_tracking').insert({ user_id: user.id, action: 'analyze_dataset', resource_type: 'dataset', tokens_used: Math.ceil(result.length / 4) });

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Dataset analysis error:', error);
    return new Response(error.message, { status: 500 });
  }
}

