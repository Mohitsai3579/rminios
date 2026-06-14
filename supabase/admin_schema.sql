-- RMinios Admin Schema Extension
-- Run this AFTER the main schema.sql in Supabase SQL Editor

-- Profiles table with admin role
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
  is_active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  last_sign_in TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Activity log for admin tracking
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT, -- 'workspace', 'file', 'paper', 'chat', 'brainstorm'
  resource_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System settings
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO system_settings (key, value) VALUES
  ('max_file_size_mb', '20'),
  ('max_files_per_workspace', '50'),
  ('max_workspaces_per_user', '10'),
  ('allowed_file_types', '["pdf"]'),
  ('maintenance_mode', 'false'),
  ('signup_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

-- RLS for profiles (users can read own, admins can read all)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
-- Admin policies use service role key, so no RLS policy needed for admin access

-- RLS for activity_log
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own activity" ON activity_log FOR SELECT USING (auth.uid() = user_id);

-- RLS for system_settings (read-only for authenticated users)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read settings" ON system_settings FOR SELECT USING (auth.role() = 'authenticated');

-- Admin stats function
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'total_workspaces', (SELECT COUNT(*) FROM workspaces),
    'total_files', (SELECT COUNT(*) FROM files),
    'total_papers', (SELECT COUNT(*) FROM papers),
    'total_conversations', (SELECT COUNT(*) FROM conversations),
    'total_messages', (SELECT COUNT(*) FROM messages),
    'total_brainstorms', (SELECT COUNT(*) FROM brainstorms),
    'total_chunks', (SELECT COUNT(*) FROM chunks),
    'total_storage_bytes', (SELECT COALESCE(SUM(size_bytes), 0) FROM files),
    'files_by_status', (
      SELECT json_object_agg(processing_status, cnt)
      FROM (SELECT processing_status, COUNT(*) as cnt FROM files GROUP BY processing_status) s
    ),
    'users_last_7_days', (SELECT COUNT(*) FROM auth.users WHERE created_at > NOW() - INTERVAL '7 days'),
    'files_last_7_days', (SELECT COUNT(*) FROM files WHERE created_at > NOW() - INTERVAL '7 days')
  ) INTO result;
  RETURN result;
END;
$$;

-- To make yourself admin, run this after signing up:
-- UPDATE profiles SET role = 'superadmin' WHERE email = 'your-email@example.com';
