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
    
    // Fetch users from profiles table
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    return NextResponse.json(users);
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const supabaseUser = await createClient();
    if (!(await isAdmin(supabaseUser))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId, role, is_active } = await request.json();
    const supabaseAdmin = await createServiceClient();
    
    // Don't allow changing your own role or superadmin via basic API
    const { data: { user: currentUser } } = await supabaseUser.auth.getUser();
    if (userId === currentUser.id && role !== undefined) {
      return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
    }

    const updates = {};
    if (role !== undefined) updates.role = role;
    if (is_active !== undefined) updates.is_active = is_active;
    updates.updated_at = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId);
      
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin update user error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
