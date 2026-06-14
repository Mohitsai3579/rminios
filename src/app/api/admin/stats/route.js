import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Helper to check admin role
async function isAdmin(supabaseAuth) {
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return false;
  
  // Need to use service client to bypass RLS to check profile if needed, 
  // but users can read their own profile.
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
    
    // Call the RPC function we defined in admin_schema.sql
    const { data: stats, error } = await supabaseAdmin.rpc('get_admin_stats');
    
    if (error) {
      console.error('Error fetching admin stats:', error);
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
