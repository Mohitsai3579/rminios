-- RMinios Database Schema
-- Run this in Supabase SQL Editor

-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🔬',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Files
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'pdf',
  storage_path TEXT NOT NULL,
  size_bytes BIGINT,
  page_count INTEGER,
  extracted_text TEXT,
  processing_status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chunks for RAG
CREATE TABLE IF NOT EXISTS chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  page_number INTEGER,
  embedding VECTOR(768),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'New Chat',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sources JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Papers (written/edited)
CREATE TABLE IF NOT EXISTS papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'Untitled Paper',
  sections JSONB DEFAULT '[]',
  citation_style TEXT DEFAULT 'apa',
  status TEXT DEFAULT 'draft',
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Citations
CREATE TABLE IF NOT EXISTS citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  source_file_id UUID REFERENCES files(id) ON DELETE SET NULL,
  title TEXT,
  authors TEXT[] DEFAULT '{}',
  year INTEGER,
  journal TEXT,
  volume TEXT,
  issue TEXT,
  pages TEXT,
  doi TEXT,
  url TEXT,
  abstract TEXT,
  raw_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brainstorms
CREATE TABLE IF NOT EXISTS brainstorms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'Brainstorm Session',
  ideas JSONB DEFAULT '[]',
  gaps JSONB DEFAULT '[]',
  themes JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding VECTOR(768),
  match_workspace_id UUID,
  match_threshold FLOAT DEFAULT 0.3,
  match_count INT DEFAULT 8
)
RETURNS TABLE (
  id UUID,
  file_id UUID,
  file_name TEXT,
  content TEXT,
  chunk_index INTEGER,
  page_number INTEGER,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.file_id,
    f.name AS file_name,
    c.content,
    c.chunk_index,
    c.page_number,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM chunks c
  JOIN files f ON f.id = c.file_id
  WHERE c.workspace_id = match_workspace_id
    AND c.embedding IS NOT NULL
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Row Level Security
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE brainstorms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users manage own workspaces" ON workspaces FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own files" ON files FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own chunks" ON chunks FOR ALL USING (
  workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid())
);
CREATE POLICY "Users manage own conversations" ON conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own messages" ON messages FOR ALL USING (
  conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid())
);
CREATE POLICY "Users manage own papers" ON papers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own citations" ON citations FOR ALL USING (
  workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid())
);
CREATE POLICY "Users manage own brainstorms" ON brainstorms FOR ALL USING (auth.uid() = user_id);

-- Create storage bucket for papers
INSERT INTO storage.buckets (id, name, public) VALUES ('papers', 'papers', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy
CREATE POLICY "Users upload own papers" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'papers' AND auth.role() = 'authenticated');
CREATE POLICY "Users read own papers" ON storage.objects FOR SELECT
  USING (bucket_id = 'papers' AND auth.role() = 'authenticated');
CREATE POLICY "Users delete own papers" ON storage.objects FOR DELETE
  USING (bucket_id = 'papers' AND auth.role() = 'authenticated');
