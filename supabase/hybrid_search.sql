-- Hybrid Search (Dense Vector + BM25 Sparse Search)
-- Uses Reciprocal Rank Fusion (RRF)

-- 1. First, we need to ensure pg_trgm is available (we already have it, but just in case)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Add an FTS generated column to the chunks table (if not exists)
-- This automatically indexes the 'content' column for fast text searching
ALTER TABLE chunks ADD COLUMN IF NOT EXISTS fts tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;
CREATE INDEX IF NOT EXISTS chunks_fts_idx ON chunks USING GIN (fts);

-- 3. Create the Hybrid Search Function
CREATE OR REPLACE FUNCTION hybrid_match_chunks(
    query_text TEXT,
    query_embedding VECTOR(768),
    match_workspace_id UUID,
    match_count INT DEFAULT 15,
    full_text_weight FLOAT DEFAULT 1.0,
    semantic_weight FLOAT DEFAULT 1.0,
    rrf_k INT DEFAULT 60
)
RETURNS TABLE (
    id UUID,
    file_id UUID,
    content TEXT,
    page_number INTEGER,
    chunk_index INTEGER,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH semantic_search AS (
        SELECT 
            c.id, 
            RANK() OVER (ORDER BY c.embedding <=> query_embedding) as rank,
            1 - (c.embedding <=> query_embedding) as semantic_sim
        FROM chunks c
        WHERE c.workspace_id = match_workspace_id
        ORDER BY c.embedding <=> query_embedding
        LIMIT match_count * 2
    ),
    keyword_search AS (
        SELECT 
            c.id, 
            RANK() OVER (ORDER BY ts_rank_cd(c.fts, websearch_to_tsquery('english', query_text)) DESC) as rank,
            ts_rank_cd(c.fts, websearch_to_tsquery('english', query_text)) as keyword_sim
        FROM chunks c
        WHERE c.workspace_id = match_workspace_id
        AND c.fts @@ websearch_to_tsquery('english', query_text)
        ORDER BY keyword_sim DESC
        LIMIT match_count * 2
    ),
    rrf_fusion AS (
        SELECT 
            COALESCE(s.id, k.id) as chunk_id,
            COALESCE(1.0 / (rrf_k + s.rank), 0.0) * semantic_weight +
            COALESCE(1.0 / (rrf_k + k.rank), 0.0) * full_text_weight AS combined_score
        FROM semantic_search s
        FULL OUTER JOIN keyword_search k ON s.id = k.id
    )
    SELECT 
        c.id,
        c.file_id,
        c.content,
        c.page_number,
        c.chunk_index,
        f.combined_score::FLOAT as similarity
    FROM rrf_fusion f
    JOIN chunks c ON c.id = f.chunk_id
    ORDER BY f.combined_score DESC
    LIMIT match_count;
END;
$$;
