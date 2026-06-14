'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Upload, Database, BarChart3, Trash2, Loader, Sparkles } from 'lucide-react';

export default function DatasetsTab({ workspaceId }) {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(null);
  const supabase = createClient();

  useEffect(() => { loadDatasets(); }, [workspaceId]);

  async function loadDatasets() {
    const { data } = await supabase.from('datasets').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false });
    setDatasets(data || []);
    setLoading(false);
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const { data: { user } } = await supabase.auth.getUser();
    const path = `${user.id}/${workspaceId}/${Date.now()}_${file.name}`;
    const { error: uploadErr } = await supabase.storage.from('datasets').upload(path, file);
    if (uploadErr) { 
      alert(`Storage Error: ${uploadErr.message}. Please run setup_rls.sql script.`); 
      console.error(uploadErr); 
      return; 
    }
    const { data, error } = await supabase.from('datasets').insert({ workspace_id: workspaceId, user_id: user.id, name: file.name, storage_path: path, format: file.name.split('.').pop(), size_bytes: file.size }).select().single();
    if (error) {
      alert(`Database Error: ${error.message}. Please run setup_rls.sql script.`);
      console.error(error);
      return;
    }
    if (data) setDatasets(prev => [data, ...prev]);
  }

  async function analyzeDataset(ds) {
    setAnalyzing(ds.id);
    try {
      const res = await fetch('/api/datasets/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ datasetId: ds.id, workspaceId }) });
      if (res.ok) { const { analysis } = await res.json(); setDatasets(prev => prev.map(d => d.id === ds.id ? { ...d, analysis, quality_score: analysis.quality_score || 0 } : d)); }
    } catch (err) { console.error(err); }
    setAnalyzing(null);
  }

  async function deleteDataset(id) {
    const ds = datasets.find(d => d.id === id);
    if (ds?.storage_path) await supabase.storage.from('datasets').remove([ds.storage_path]);
    await supabase.from('datasets').delete().eq('id', id);
    setDatasets(prev => prev.filter(d => d.id !== id));
  }

  const formatSize = (bytes) => { if (!bytes) return '0 B'; const k = 1024; const s = ['B','KB','MB','GB']; const i = Math.floor(Math.log(bytes)/Math.log(k)); return (bytes/Math.pow(k,i)).toFixed(1)+' '+s[i]; };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:48 }}><div className="spinner spinner-lg"/></div>;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div><h3 style={{ marginBottom:4 }}>Datasets</h3><p style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>Upload and analyze research datasets</p></div>
        <label className="btn btn-primary" style={{ cursor:'pointer' }}><Upload size={16}/> Upload Dataset<input type="file" accept=".csv,.json,.xlsx,.tsv" onChange={handleUpload} style={{ display:'none' }}/></label>
      </div>

      {datasets.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📊</div><h3>No datasets yet</h3><p>Upload CSV, JSON, or Excel files for AI-powered analysis</p></div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:16 }}>
          {datasets.map(ds => (
            <div key={ds.id} className="project-card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:40, height:40, borderRadius:'var(--radius-sm)', background:'rgba(45,212,191,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}><Database size={20} style={{ color:'var(--teal)' }}/></div>
                  <div><div style={{ fontWeight:600, fontSize:'0.9rem' }}>{ds.name}</div><div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{formatSize(ds.size_bytes)} • {ds.format?.toUpperCase()}{ds.row_count ? ` • ${ds.row_count} rows` : ''}</div></div>
                </div>
                <button className="btn btn-icon btn-ghost btn-sm" onClick={() => deleteDataset(ds.id)} style={{ color:'var(--rose)' }}><Trash2 size={14}/></button>
              </div>
              {ds.analysis?.summary && <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', marginBottom:12, lineHeight:1.6 }}>{ds.analysis.summary}</p>}
              {ds.quality_score > 0 && (
                <div style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', marginBottom:4 }}><span style={{ color:'var(--text-muted)' }}>Quality Score</span><span style={{ fontWeight:600 }}>{ds.quality_score}/100</span></div>
                  <div className="metric-bar"><div className="metric-fill" style={{ width:`${ds.quality_score}%`, background: ds.quality_score >= 70 ? 'var(--green)' : ds.quality_score >= 40 ? 'var(--amber)' : 'var(--rose)' }}/></div>
                </div>
              )}
              <button className="btn btn-sm btn-secondary w-full" onClick={() => analyzeDataset(ds)} disabled={analyzing === ds.id}>
                {analyzing === ds.id ? <><Loader size={12} style={{ animation:'spin 1s linear infinite' }}/> Analyzing...</> : <><Sparkles size={12}/> AI Analyze</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
