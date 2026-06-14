import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'global').single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Settings GET Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      // Fallback defaults if table is empty or missing
      return NextResponse.json({
        owner_name: 'Mohit Jonnadula',
        support_email: 'mohitjonnadula16@gmail.com',
        support_phone: '9494366318'
      });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    // Check if admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updates = await request.json();
    
    const { error } = await supabase.from('site_settings').upsert({
      id: 'global',
      owner_name: updates.owner_name,
      support_email: updates.support_email,
      support_phone: updates.support_phone,
      updated_at: new Date().toISOString()
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Settings POST Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
