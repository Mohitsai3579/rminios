import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient();
    const { id } = params;

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Ensure the workspace belongs to the user
    const { data: workspace } = await supabase.from('workspaces').select('user_id').eq('id', id).single();
    if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    
    // Check if user is owner or admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const isAdmin = profile && (profile.role === 'admin' || profile.role === 'superadmin');
    
    if (workspace.user_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the workspace. Supabase handles cascade deletes for files/chats if configured, otherwise we just delete the workspace record.
    const { error } = await supabase.from('workspaces').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete Workspace Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
