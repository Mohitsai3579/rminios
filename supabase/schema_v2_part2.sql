-- RMinios v2 — Schema Part 2: Platform, Collaboration, Functions & RLS

-- Teams & Collaboration
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner','admin','member','viewer')),
  joined_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(team_id, user_id)
);
CREATE TABLE IF NOT EXISTS team_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  permission TEXT DEFAULT 'read' CHECK (permission IN ('read','write','admin')),
  UNIQUE(team_id, workspace_id)
);

-- Versions
CREATE TABLE IF NOT EXISTS versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('paper','project','experiment','note','presentation')),
  resource_id UUID NOT NULL, user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  data JSONB NOT NULL, version_number INTEGER DEFAULT 1, change_summary TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plans
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
  description TEXT, features JSONB DEFAULT '[]', limits JSONB DEFAULT '{}',
  price_monthly DECIMAL(10,2) DEFAULT 0, price_yearly DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true, sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO plans (name, slug, description, features, limits, price_monthly, price_yearly, sort_order) VALUES
('Free','free','Basic research tools','["5 workspaces","20 files/workspace","50 AI requests/day","100MB storage"]','{"workspaces":5,"files_per_workspace":20,"ai_requests_daily":50,"storage_mb":100}',0,0,1),
('Pro','pro','For serious researchers','["Unlimited workspaces","100 files/workspace","500 AI requests/day","5GB storage","Advanced features"]','{"workspaces":-1,"files_per_workspace":100,"ai_requests_daily":500,"storage_mb":5120}',9.99,99.99,2),
('Researcher','researcher','Full research suite','["Everything in Pro","Unlimited AI","25GB storage","All modules"]','{"workspaces":-1,"files_per_workspace":-1,"ai_requests_daily":-1,"storage_mb":25600}',19.99,199.99,3),
('University','university','For institutions','["Everything in Researcher","100GB","Team management","Admin tools"]','{"workspaces":-1,"files_per_workspace":-1,"ai_requests_daily":-1,"storage_mb":102400}',49.99,499.99,4),
('Enterprise','enterprise','For organizations','["Unlimited everything","Dedicated support","Custom integrations"]','{"workspaces":-1,"files_per_workspace":-1,"ai_requests_daily":-1,"storage_mb":-1}',99.99,999.99,5)
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES plans(id), status TEXT DEFAULT 'active' CHECK (status IN ('active','cancelled','expired','past_due')),
  payment_provider TEXT, payment_id TEXT, current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL, resource_type TEXT, tokens_used INTEGER DEFAULT 0,
  model TEXT DEFAULT 'gemini-2.0-flash', cost_estimate DECIMAL(10,6) DEFAULT 0,
  metadata JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT UNIQUE NOT NULL, description TEXT,
  is_enabled BOOLEAN DEFAULT false, roles_allowed TEXT[] DEFAULT '{}', plans_allowed TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO feature_flags (name, description, is_enabled) VALUES
('monetization','Enable payments',false),('teams','Team features',true),
('learning_engine','Adaptive learning',true),('presentations','Slide generation',true),
('knowledge_graph','Knowledge graph',true),('experiments','Experiment tracking',true)
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, resource_type TEXT, resource_id UUID, details JSONB DEFAULT '{}',
  ip_address TEXT, user_agent TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_settings (key TEXT PRIMARY KEY, value JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());
INSERT INTO system_settings (key, value) VALUES
('max_file_size_mb','20'),('maintenance_mode','false'),('signup_enabled','true'),
('monetization_enabled','false'),('default_ai_model','"gemini-2.0-flash"'),('rate_limit_rpm','15')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE, topic TEXT NOT NULL,
  level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner','intermediate','advanced','research')),
  progress_pct INTEGER DEFAULT 0, quiz_scores JSONB DEFAULT '[]', learning_path JSONB DEFAULT '[]',
  completed_modules JSONB DEFAULT '[]', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector search function
CREATE OR REPLACE FUNCTION match_chunks(query_embedding VECTOR(768), match_workspace_id UUID, match_threshold FLOAT DEFAULT 0.3, match_count INT DEFAULT 8)
RETURNS TABLE (id UUID, file_id UUID, file_name TEXT, content TEXT, chunk_index INTEGER, page_number INTEGER, similarity FLOAT)
LANGUAGE plpgsql AS $$
BEGIN RETURN QUERY SELECT c.id, c.file_id, f.name, c.content, c.chunk_index, c.page_number, 1-(c.embedding<=>query_embedding)
FROM chunks c JOIN files f ON f.id=c.file_id WHERE c.workspace_id=match_workspace_id AND c.embedding IS NOT NULL AND 1-(c.embedding<=>query_embedding)>match_threshold
ORDER BY c.embedding<=>query_embedding LIMIT match_count; END; $$;

-- Enhanced admin stats
CREATE OR REPLACE FUNCTION get_admin_stats() RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE r JSON;
BEGIN SELECT json_build_object(
'total_users',(SELECT COUNT(*) FROM auth.users),'active_users',(SELECT COUNT(*) FROM profiles WHERE is_active=true),
'total_workspaces',(SELECT COUNT(*) FROM workspaces),'total_files',(SELECT COUNT(*) FROM files),
'total_papers',(SELECT COUNT(*) FROM papers),'total_conversations',(SELECT COUNT(*) FROM conversations),
'total_messages',(SELECT COUNT(*) FROM messages),'total_brainstorms',(SELECT COUNT(*) FROM brainstorms),
'total_chunks',(SELECT COUNT(*) FROM chunks),'total_notes',(SELECT COUNT(*) FROM notes),
'total_projects',(SELECT COUNT(*) FROM projects),'total_experiments',(SELECT COUNT(*) FROM experiments),
'total_presentations',(SELECT COUNT(*) FROM presentations),'total_teams',(SELECT COUNT(*) FROM teams),
'total_storage_bytes',(SELECT COALESCE(SUM(size_bytes),0) FROM files),
'total_ai_tokens',(SELECT COALESCE(SUM(tokens_used),0) FROM usage_tracking),
'files_by_status',(SELECT COALESCE(json_object_agg(processing_status,cnt),'{}') FROM (SELECT processing_status,COUNT(*) as cnt FROM files GROUP BY processing_status) s),
'users_by_role',(SELECT COALESCE(json_object_agg(role,cnt),'{}') FROM (SELECT role,COUNT(*) as cnt FROM profiles GROUP BY role) s),
'users_by_plan',(SELECT COALESCE(json_object_agg(plan,cnt),'{}') FROM (SELECT plan,COUNT(*) as cnt FROM profiles GROUP BY plan) s),
'users_last_7_days',(SELECT COUNT(*) FROM auth.users WHERE created_at>NOW()-INTERVAL '7 days'),
'files_last_7_days',(SELECT COUNT(*) FROM files WHERE created_at>NOW()-INTERVAL '7 days'),
'ai_requests_today',(SELECT COUNT(*) FROM usage_tracking WHERE created_at>NOW()-INTERVAL '1 day')
) INTO r; RETURN r; END; $$;

-- RLS on ALL tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE brainstorms ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "p_profiles_sel" ON profiles FOR SELECT USING (auth.uid()=id);
CREATE POLICY "p_profiles_upd" ON profiles FOR UPDATE USING (auth.uid()=id);
CREATE POLICY "p_ws" ON workspaces FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "p_files" ON files FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "p_chunks" ON chunks FOR ALL USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id=auth.uid()));
CREATE POLICY "p_conv" ON conversations FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "p_msg" ON messages FOR ALL USING (conversation_id IN (SELECT id FROM conversations WHERE user_id=auth.uid()));
CREATE POLICY "p_papers" ON papers FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "p_notes" ON notes FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "p_brainstorms" ON brainstorms FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "p_projects" ON projects FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "p_experiments" ON experiments FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "p_presentations" ON presentations FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "p_images" ON images FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "p_datasets" ON datasets FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "p_citations" ON citations FOR ALL USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id=auth.uid()));
CREATE POLICY "p_versions" ON versions FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "p_teams_sel" ON teams FOR SELECT USING (id IN (SELECT team_id FROM team_members WHERE user_id=auth.uid()) OR owner_id=auth.uid());
CREATE POLICY "p_teams_all" ON teams FOR ALL USING (owner_id=auth.uid());
CREATE POLICY "p_tm" ON team_members FOR SELECT USING (team_id IN (SELECT team_id FROM team_members tm WHERE tm.user_id=auth.uid()));
CREATE POLICY "p_usage_sel" ON usage_tracking FOR SELECT USING (auth.uid()=user_id);
CREATE POLICY "p_usage_ins" ON usage_tracking FOR INSERT WITH CHECK (auth.uid()=user_id);
CREATE POLICY "p_activity" ON activity_log FOR SELECT USING (auth.uid()=user_id);
CREATE POLICY "p_settings" ON system_settings FOR SELECT USING (auth.role()='authenticated');
CREATE POLICY "p_flags" ON feature_flags FOR SELECT USING (auth.role()='authenticated');
CREATE POLICY "p_plans" ON plans FOR SELECT USING (true);
CREATE POLICY "p_subs" ON user_subscriptions FOR SELECT USING (auth.uid()=user_id);
CREATE POLICY "p_learning" ON learning_progress FOR ALL USING (auth.uid()=user_id);

-- Storage buckets
INSERT INTO storage.buckets (id,name,public) VALUES ('papers','papers',false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id,name,public) VALUES ('datasets','datasets',false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id,name,public) VALUES ('images','images',true) ON CONFLICT (id) DO NOTHING;
