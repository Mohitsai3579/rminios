import { createClient } from '@/lib/supabase/server';
import { generateText, safeParseJSON } from '@/lib/gemini';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { projectId, workspaceId, title, type, description } = await request.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const prompt = `Generate a comprehensive project specification for a research/technical project:
Title: ${title}
Type: ${type}
Description: ${description || 'Not provided'}

Return a JSON object with:
1. "architecture": {"overview": "text description", "components": ["list of components"]}
2. "roadmap": [{"phase": "Phase 1: Setup", "tasks": ["task 1", "task 2"]}, ...] (3-4 phases)
3. "tech_stack": ["Tech1", "Tech2", ...] (5-8 relevant technologies)
4. "folder_structure": "A tree-like text representation of the recommended folder structure"
5. "documentation": "A short generated README.md content"
6. "starter_code": "A relevant code snippet (python, js, etc.) to get started"

Format the response as pure JSON.`;

    const systemPrompt = "You are a Principal Software Architect and Research Engineer. Return only valid JSON without markdown wrapping.";
    const result = await generateText(prompt, systemPrompt);
    
    const data = safeParseJSON(result, {
      architecture: { overview: 'Could not generate. Please try again.', components: [] },
      roadmap: [],
      tech_stack: [],
      folder_structure: '',
      documentation: '',
      starter_code: '',
    });

    await supabase.from('projects').update({
      architecture: data.architecture,
      roadmap: data.roadmap,
      tech_stack: data.tech_stack,
      folder_structure: data.folder_structure,
      documentation: data.documentation,
      starter_code: data.starter_code,
      updated_at: new Date().toISOString()
    }).eq('id', projectId);

    try {
      await supabase.from('usage_tracking').insert({ user_id: user.id, action: 'generate_project', resource_type: 'project', tokens_used: Math.ceil(result.length / 4) });
    } catch (trackErr) {
      // Non-critical
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Project generation error:', error);
    return NextResponse.json({ error: error.message || 'Project generation failed' }, { status: 500 });
  }
}
