require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data: userRecord } = await supabaseAdmin.auth.admin.listUsers();
  const userId = userRecord.users[0]?.id;
  const { data: ws } = await supabaseAdmin.from('workspaces').select('*').limit(1);
  const workspaceId = ws[0]?.id;
  
  if (!userId || !workspaceId) { console.log('No user or workspace found'); return; }

  const { data, error } = await supabaseAdmin.from('projects').insert({
    workspace_id: workspaceId,
    user_id: userId,
    title: 'Test',
    project_type: 'ai',
    description: 'test'
  }).select();
  
  console.log('Admin Insert Projects:', error ? error.message : 'SUCCESS');

  const { data: d2, error: e2 } = await supabaseAdmin.from('datasets').insert({
    workspace_id: workspaceId,
    user_id: userId,
    name: 'Test',
    storage_path: 'test',
    row_count: 0
  }).select();

  console.log('Admin Insert Datasets:', e2 ? e2.message : 'SUCCESS');

  const { data: d3, error: e3 } = await supabaseAdmin.from('experiments').insert({
    workspace_id: workspaceId,
    user_id: userId,
    title: 'Test',
    hypothesis: 'test'
  }).select();

  console.log('Admin Insert Experiments:', e3 ? e3.message : 'SUCCESS');
}
test();
