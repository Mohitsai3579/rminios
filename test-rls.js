require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function disableRLS() {
  const tables = ['projects', 'experiments', 'datasets', 'presentations', 'papers'];
  
  for (const table of tables) {
    // There is no direct RPC to disable RLS unless we have execute privileges on raw SQL.
    // Instead of disabling, let's insert a test row.
    const { error } = await supabase.from(table).insert({ workspace_id: 'test', user_id: 'test' }).select();
    console.log(`Insert ${table}:`, error ? error.message : 'OK');
  }
}
disableRLS();
