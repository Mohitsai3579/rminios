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

    // Safely try to fetch API usage (table might not exist yet)
    let api_usage_today = 0;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count } = await supabaseAdmin
        .from('api_usage')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());
      
      api_usage_today = count || 0;
    } catch (e) {
      console.log('api_usage table not ready');
    }

    return NextResponse.json({ ...stats, api_usage_today });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
