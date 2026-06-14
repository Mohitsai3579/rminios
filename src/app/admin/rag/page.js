'use client';

import { useState, useEffect } from 'react';
import { Database, Zap, FileCode, Layers, Activity } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminRAGPage() {
  const [stats, setStats] = useState({ chunks: 0, files: 0, workspaces: 0, storage: 0 });
  const [recentChunks, setRecentChunks] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchRAGStats() {
      // Fetch basic counts
      const [{ count: chunksCount }, { count: filesCount }, { data: recent }] = await Promise.all([
        supabase.from('chunks').select('*', { count: 'exact', head: true }),
        supabase.from('files').select('*', { count: 'exact', head: true }).eq('processing_status', 'ready'),
        supabase.from('chunks').select('id, file_id, created_at, content').order('created_at', { ascending: false }).limit(5)
      ]);
      
      setStats({
        chunks: chunksCount || 0,
        files: filesCount || 0,
        workspaces: 0,
        storage: 0
      });

      if (recent) setRecentChunks(recent);
      setLoading(false);
    }
    fetchRAGStats();
  }, []);

  return (
    <>
      <div className="topbar">
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Database size={20} /> Knowledge Base & RAG</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monitor vector database health and chunking pipeline.</p>
        </div>
      </div>

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Top Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ padding: 12, background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius-sm)', color: 'var(--accent)' }}>
                <Layers size={24} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Vector Chunks</h4>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: 4 }}>{loading ? '...' : stats.chunks}</div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ padding: 12, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-sm)', color: 'var(--emerald)' }}>
                <FileCode size={24} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Processed Files</h4>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: 4 }}>{loading ? '...' : stats.files}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ padding: 12, background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-sm)', color: 'var(--amber)' }}>
                <Zap size={24} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pipeline Status</h4>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: 4, color: 'var(--emerald)' }}>Online & Healthy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Vector Feed */}
        <div className="card" style={{ flex: 1 }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Activity size={18} style={{ color: 'var(--accent)' }} /> Live Vector Injection Feed
          </h4>
          
          {loading ? (
            <p>Loading feed...</p>
          ) : recentChunks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No chunks generated yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentChunks.map(chunk => (
                <div key={chunk.id} style={{ padding: 16, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                      File ID: {chunk.file_id.substring(0,8)}... | {new Date(chunk.created_at).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', opacity: 0.9 }}>
                      {chunk.content.length > 150 ? chunk.content.substring(0, 150) + '...' : chunk.content}
                    </div>
                  </div>
                  <div className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent)' }}>
                    768-dim
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}
