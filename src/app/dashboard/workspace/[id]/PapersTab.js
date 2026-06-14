'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Trash2, RefreshCw, CheckCircle, AlertCircle, Clock, Loader, Globe, Cloud, GraduationCap, Search, Link as LinkIcon, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function PapersTab({ workspaceId }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('local');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const supabase = createClient();

  useEffect(() => { loadFiles(); }, [workspaceId]);

  async function loadFiles() {
    const { data } = await supabase.from('files').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false });
    setFiles(data || []);
    setLoading(false);
  }

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();

    for (const file of acceptedFiles) {
      const ext = file.name.split('.').pop();
      const path = `${workspaceId}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage.from('papers').upload(path, file);
      if (uploadError) continue;

      const { data: fileRecord, error: dbError } = await supabase.from('files').insert({
        workspace_id: workspaceId, user_id: user.id, name: file.name, file_type: ext === 'pdf' ? 'pdf' : 'document',
        storage_path: path, size_bytes: file.size, processing_status: 'pending',
      }).select().single();

      if (dbError) continue;

      try {
        await fetch('/api/files/process', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileId: fileRecord.id, workspaceId }) });
      } catch (err) { console.error(err); }
    }
    setUploading(false);
    loadFiles();
  }, [workspaceId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, maxSize: 20 * 1024 * 1024 });

  async function deleteFile(fileId, storagePath) {
    await supabase.storage.from('papers').remove([storagePath]);
    await supabase.from('chunks').delete().eq('file_id', fileId);
    await supabase.from('files').delete().eq('id', fileId);
    loadFiles();
  }

  async function reprocessFile(fileId) {
    await supabase.from('files').update({ processing_status: 'pending' }).eq('id', fileId);
    loadFiles();
    fetch('/api/files/process', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileId, workspaceId }) }).then(loadFiles);
  }

  const handleWebSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchResults([]);
    try {
      const res = await fetch(`/api/search/arxiv?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.results) {
        setSearchResults(data.results);
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const statusIcon = (status) => {
    switch (status) {
      case 'ready': return <><div className="status-dot status-ready" /><span style={{ color: 'var(--green)' }}>Ready</span></>;
      case 'processing': return <><div className="status-dot status-processing" /><span style={{ color: 'var(--amber)' }}>Processing</span></>;
      case 'error': return <><div className="status-dot status-error" /><span style={{ color: 'var(--rose)' }}>Error</span></>;
      default: return <><div className="status-dot status-pending" /><span>Pending</span></>;
    }
  };

  return (
    <div>
      {/* Universal Ingestion Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
        <button className={`btn btn-sm ${activeTab === 'local' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('local')}><Upload size={14}/> Local Device</button>
        <button className={`btn btn-sm ${activeTab === 'arxiv' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('arxiv')}><GraduationCap size={14}/> Academic Search</button>
        <button className={`btn btn-sm ${activeTab === 'drive' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('drive')}><Cloud size={14}/> Google Drive</button>
        <button className={`btn btn-sm ${activeTab === 'url' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('url')}><LinkIcon size={14}/> Web URL</button>
      </div>

      {/* Ingestion Panes */}
      <div style={{ marginBottom: 32 }}>
        {activeTab === 'local' && (
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            {uploading ? (
              <><Loader size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: 12, color: 'var(--accent-light)' }} /><p>Uploading...</p></>
            ) : (
              <><Upload size={32} style={{ marginBottom: 12, color: 'var(--accent-light)' }} /><p>{isDragActive ? 'Drop your papers here' : 'Drag & drop PDFs here, or click to browse'}</p></>
            )}
          </div>
        )}

        {activeTab === 'arxiv' && (
          <div className="card" style={{ padding: 24, background: 'var(--bg-tertiary)' }}>
            <h4 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 6 }}><Search size={16} /> Search ArXiv & Semantic Scholar</h4>
            <form onSubmit={handleWebSearch} style={{ display: 'flex', gap: 8 }}>
              <input type="text" className="input" placeholder="Search by paper title, author, or DOI..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ flex: 1 }} />
              <button type="submit" className="btn btn-primary">{searchLoading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Search'}</button>
            </form>
            
            {searchResults.length > 0 && (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {searchResults.map(res => (
                  <div key={res.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{res.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{res.authors} • {res.year} • {res.source}</div>
                    </div>
                    <button className="btn btn-sm btn-secondary"><Download size={14} /> Import</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'drive' && (
          <div className="card" style={{ padding: 32, textAlign: 'center', background: 'var(--bg-tertiary)' }}>
            <Cloud size={32} style={{ margin: '0 auto 16px auto', color: 'var(--blue)' }} />
            <h4 style={{ margin: '0 0 8px 0' }}>Connect Google Drive</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>Import PDFs directly from your Google Drive without downloading them first.</p>
            <button className="btn btn-secondary">Connect Account</button>
          </div>
        )}

        {activeTab === 'url' && (
          <div className="card" style={{ padding: 24, background: 'var(--bg-tertiary)' }}>
            <h4 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 6 }}><LinkIcon size={16} /> Direct URL Import</h4>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="url" className="input" placeholder="https://example.com/paper.pdf" style={{ flex: 1 }} />
              <button className="btn btn-primary">Import PDF</button>
            </div>
          </div>
        )}
      </div>

      {/* File List */}
      <h4 style={{ marginBottom: 16 }}>Workspace Knowledge Base</h4>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 'var(--radius-sm)' }} />)}</div>
      ) : files.length === 0 ? (
        <div className="empty-state" style={{ padding: 48 }}><div className="empty-state-icon">📄</div><h3>No papers ingested</h3><p>Ingest research papers using the tools above</p></div>
      ) : (
        <div className="file-list">
          {files.map(file => (
            <div key={file.id} className="file-item">
              <div className="file-icon"><FileText size={18} /></div>
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                <div className="file-meta">
                  {(file.size_bytes / 1024).toFixed(0)} KB
                  {file.page_count && ` • ${file.page_count} pages`} • {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                </div>
              </div>
              <div className="file-status">{statusIcon(file.processing_status)}</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {file.processing_status === 'error' && <button className="btn btn-icon btn-ghost" onClick={() => reprocessFile(file.id)} title="Retry"><RefreshCw size={14} /></button>}
                <button className="btn btn-icon btn-ghost" onClick={() => deleteFile(file.id, file.storage_path)} title="Delete" style={{ color: 'var(--rose)' }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
