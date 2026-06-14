import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function isAdmin(supabaseAuth) {
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabaseAuth.from('profiles').select('role').eq('id', user.id).single();
  return profile && (profile.role === 'admin' || profile.role === 'superadmin');
}

export async function GET(request) {
  try {
    const supabaseUser = await createClient();
    if (!(await isAdmin(supabaseUser))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const supabaseAdmin = await createServiceClient();
    
    // Fetch workspaces without native join
    const { data: workspaces, error } = await supabaseAdmin
      .from('workspaces')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    // Fetch all profiles to map manually
    const { data: profiles } = await supabaseAdmin.from('profiles').select('id, email, full_name');
    const profileMap = {};
    if (profiles) {
      profiles.forEach(p => {
        profileMap[p.id] = p;
      });
    }

    // Attach profile info manually
    workspaces.forEach(ws => {
      ws.profiles = profileMap[ws.user_id] || { email: 'Unknown', full_name: 'Unknown' };
    });

    // Get file counts for each workspace
    const { data: fileCounts, error: countError } = await supabaseAdmin
      .from('files')
      .select('workspace_id');
      
    if (!countError && fileCounts) {
       // Group and count
       const counts = fileCounts.reduce((acc, curr) => {
         acc[curr.workspace_id] = (acc[curr.workspace_id] || 0) + 1;
         return acc;
       }, {});
       
       workspaces.forEach(ws => {
         ws.file_count = counts[ws.id] || 0;
       });
    }

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error('Admin workspaces error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const supabaseUser = await createClient();
    if (!(await isAdmin(supabaseUser))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const supabaseAdmin = await createServiceClient();
    
    // Deleting workspace will cascade and delete files, but we also need to delete from storage
    const { data: files } = await supabaseAdmin.from('files').select('storage_path').eq('workspace_id', id);
    
    if (files && files.length > 0) {
       const paths = files.map(f => f.storage_path);
       await supabaseAdmin.storage.from('papers').remove(paths);
    }
    
    const { error } = await supabaseAdmin.from('workspaces').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete workspace error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
