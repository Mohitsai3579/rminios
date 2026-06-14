-- RMinios v2 — Complete Schema (Part 1: Core Tables)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT, full_name TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('guest','student','researcher','professor','team_lead','university_admin','admin','superadmin')),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free','pro','researcher','university','enterprise')),
  is_active BOOLEAN DEFAULT true, avatar_url TEXT, bio TEXT, institution TEXT, department TEXT,
  research_interests TEXT[] DEFAULT '{}', onboarding_completed BOOLEAN DEFAULT false,
  usage_limits JSONB DEFAULT '{"ai_requests_daily":50,"storage_mb":100,"workspaces":5,"files_per_workspace":20}',
  last_sign_in TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name) VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_id UUID, name TEXT NOT NULL, description TEXT, icon TEXT DEFAULT '🔬',
  tags TEXT[] DEFAULT '{}', is_shared BOOLEAN DEFAULT false, settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, file_type TEXT DEFAULT 'pdf', storage_path TEXT NOT NULL,
  size_bytes BIGINT, page_count INTEGER, extracted_text TEXT,
  extracted_metadata JSONB DEFAULT '{}', processing_status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL, chunk_index INTEGER NOT NULL, page_number INTEGER,
  embedding VECTOR(768), metadata JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'New Chat', context_type TEXT DEFAULT 'research',
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL, sources JSONB DEFAULT '[]', tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'Untitled Paper', sections JSONB DEFAULT '[]',
  citation_style TEXT DEFAULT 'apa', target_venue TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','final','published')),
  word_count INTEGER DEFAULT 0, readiness_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  source_file_id UUID REFERENCES files(id) ON DELETE SET NULL,
  title TEXT, authors TEXT[] DEFAULT '{}', year INTEGER, journal TEXT,
  volume TEXT, issue TEXT, pages TEXT, doi TEXT, url TEXT, abstract TEXT,
  raw_text TEXT, verified BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brainstorms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'Brainstorm Session',
  brainstorm_type TEXT DEFAULT 'research' CHECK (brainstorm_type IN ('research','startup','thesis','product','publication')),
  ideas JSONB DEFAULT '[]', gaps JSONB DEFAULT '[]', themes JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'Untitled Note', content TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}', is_pinned BOOLEAN DEFAULT false,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general','finding','idea','observation','question','method')),
  linked_file_id UUID REFERENCES files(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, description TEXT, storage_path TEXT, format TEXT DEFAULT 'csv',
  size_bytes BIGINT DEFAULT 0, columns JSONB DEFAULT '[]', row_count INTEGER DEFAULT 0,
  analysis JSONB DEFAULT '{}', quality_score INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  project_type TEXT DEFAULT 'ai' CHECK (project_type IN ('ai','web','mobile','iot','data_science','software','hardware','other')),
  description TEXT, architecture JSONB DEFAULT '{}', roadmap JSONB DEFAULT '[]',
  tech_stack TEXT[] DEFAULT '{}', folder_structure TEXT, documentation TEXT, starter_code TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning','active','completed','paused','archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL, hypothesis TEXT, methodology TEXT,
  variables JSONB DEFAULT '{}', results JSONB DEFAULT '{}', metrics JSONB DEFAULT '{}',
  conclusions TEXT, status TEXT DEFAULT 'planned' CHECK (status IN ('planned','running','completed','failed','cancelled')),
  version INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  paper_id UUID REFERENCES papers(id) ON DELETE SET NULL,
  title TEXT DEFAULT 'Untitled Presentation', slides JSONB DEFAULT '[]',
  speaker_notes JSONB DEFAULT '[]', viva_questions JSONB DEFAULT '[]',
  presentation_type TEXT DEFAULT 'slides' CHECK (presentation_type IN ('slides','poster','viva')),
  theme TEXT DEFAULT 'dark', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, description TEXT, storage_path TEXT,
  image_type TEXT DEFAULT 'uploaded' CHECK (image_type IN ('uploaded','generated','diagram','figure')),
  diagram_code TEXT, tags TEXT[] DEFAULT '{}', size_bytes BIGINT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW()
);
