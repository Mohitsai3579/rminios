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
    
    // Fetch recent files without native join
    const { data: files } = await supabaseAdmin.from('files').select('id, name, created_at, user_id').order('created_at', { ascending: false }).limit(10);
    
    // Fetch recent conversations
    const { data: chats } = await supabaseAdmin.from('conversations').select('id, title, created_at, user_id').order('created_at', { ascending: false }).limit(10);
    
    // Fetch recent brainstorms
    const { data: brainstorms } = await supabaseAdmin.from('brainstorms').select('id, title, created_at, user_id').order('created_at', { ascending: false }).limit(10);
    
    // Fetch recent workspaces
    const { data: workspaces } = await supabaseAdmin.from('workspaces').select('id, name, created_at, user_id').order('created_at', { ascending: false }).limit(10);
    
    // Manually map profiles
    const { data: profiles } = await supabaseAdmin.from('profiles').select('id, email');
    const profileMap = {};
    if (profiles) profiles.forEach(p => profileMap[p.id] = p.email);

    // Combine and sort
    const activity = [];
    if (files) files.forEach(f => activity.push({ type: 'file', id: f.id, title: f.name, user: profileMap[f.user_id] || 'Unknown', date: f.created_at }));
    if (chats) chats.forEach(c => activity.push({ type: 'chat', id: c.id, title: c.title, user: profileMap[c.user_id] || 'Unknown', date: c.created_at }));
    if (brainstorms) brainstorms.forEach(b => activity.push({ type: 'brainstorm', id: b.id, title: b.title, user: profileMap[b.user_id] || 'Unknown', date: b.created_at }));
    if (workspaces) workspaces.forEach(w => activity.push({ type: 'workspace', id: w.id, title: w.name, user: profileMap[w.user_id] || 'Unknown', date: w.created_at }));
    
    activity.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return NextResponse.json(activity.slice(0, 20));
  } catch (error) {
    console.error('Admin activity error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
