require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data, error } = await supabase.from('projects').select('*').limit(1);
  console.log('Projects table:', error ? error.message : 'OK');
  
  const { data: d2, error: e2 } = await supabase.from('experiments').select('*').limit(1);
  console.log('Experiments table:', e2 ? e2.message : 'OK');
  
  const { data: d3, error: e3 } = await supabase.from('datasets').select('*').limit(1);
  console.log('Datasets table:', e3 ? e3.message : 'OK');
  
  const { data: d4, error: e4 } = await supabase.from('presentations').select('*').limit(1);
  console.log('Presentations table:', e4 ? e4.message : 'OK');
}
test();
