'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Beaker, Trash2, BarChart3, Loader, Sparkles } from 'lucide-react';

export default function ExperimentsTab({ workspaceId }) {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [generating, setGenerating] = useState(null);
  const supabase = createClient();

  useEffect(() => { load(); }, [workspaceId]);

  async function load() {
    const { data } = await supabase.from('experiments').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false });
    setExperiments(data || []);
    setLoading(false);
  }

  async function create() {
    if (!title.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('experiments').insert({ workspace_id: workspaceId, user_id: user.id, title, hypothesis }).select().single();
    if (data) { setExperiments(prev => [data, ...prev]); setShowCreate(false); setTitle(''); setHypothesis(''); }
  }

  async function updateStatus(id, status) {
    await supabase.from('experiments').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    setExperiments(prev => prev.map(e => e.id === id ? { ...e, status } : e));
  }

  async function generateMethodology(exp) {
    setGenerating(exp.id);
    try {
      const res = await fetch('/api/experiments/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ experimentId: exp.id, workspaceId, title: exp.title, hypothesis: exp.hypothesis }) });
      if (res.ok) { const data = await res.json(); setExperiments(prev => prev.map(e => e.id === exp.id ? { ...e, ...data } : e)); }
    } catch (err) { console.error(err); }
    setGenerating(null);
  }

  async function del(id) {
    await supabase.from('experiments').delete().eq('id', id);
    setExperiments(prev => prev.filter(e => e.id !== id));
  }

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:48 }}><div className="spinner spinner-lg"/></div>;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div><h3 style={{ marginBottom:4 }}>Experiments</h3><p style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>Track experiments, versions, and results</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={16}/> New Experiment</button>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>New Experiment</h3><button className="btn btn-icon btn-ghost" onClick={() => setShowCreate(false)}>✕</button></div>
            <div className="input-group" style={{ marginBottom:16 }}><label>Title</label><input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Experiment title"/></div>
            <div className="input-group" style={{ marginBottom:16 }}><label>Hypothesis</label><textarea className="input" value={hypothesis} onChange={e => setHypothesis(e.target.value)} placeholder="If... then... because..." rows={3}/></div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button><button className="btn btn-primary" onClick={create}>Create</button></div>
          </div>
        </div>
      )}

      {experiments.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🧪</div><h3>No experiments yet</h3><p>Track your research experiments with hypothesis, methodology, and results</p></div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(350px,1fr))', gap:16 }}>
          {experiments.map(exp => (
            <div key={exp.id} className="project-card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}><Beaker size={18} style={{ color:'var(--teal)' }}/><h4>{exp.title}</h4></div>
                <div style={{ display:'flex', gap:4 }}>
                  <select className="input" value={exp.status} onChange={e => updateStatus(exp.id, e.target.value)} style={{ padding:'2px 6px', fontSize:'0.7rem', width:'auto' }}>
                    {['planned','running','completed','failed','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button className="btn btn-icon btn-ghost btn-sm" onClick={() => del(exp.id)} style={{ color:'var(--rose)' }}><Trash2 size={12}/></button>
                </div>
              </div>
              {exp.hypothesis && <div style={{ padding:10, background:'var(--bg-secondary)', borderRadius:'var(--radius-sm)', marginBottom:12, fontSize:'0.82rem', fontStyle:'italic', color:'var(--text-secondary)' }}>💡 {exp.hypothesis}</div>}
              {exp.methodology && <div style={{ marginBottom:12 }}><span style={{ fontSize:'0.75rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase' }}>Methodology</span><p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', marginTop:4, lineHeight:1.6 }}>{exp.methodology}</p></div>}
              {exp.metrics && Object.keys(exp.metrics).length > 0 && (
                <div style={{ marginBottom:12 }}><span style={{ fontSize:'0.75rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase' }}>Metrics</span>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8, marginTop:8 }}>
                    {Object.entries(exp.metrics).map(([k,v]) => <div key={k} style={{ padding:8, background:'var(--bg-secondary)', borderRadius:'var(--radius-sm)', textAlign:'center' }}><div style={{ fontSize:'1rem', fontWeight:600 }}>{v}</div><div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{k}</div></div>)}
                  </div>
                </div>
              )}
              <div style={{ display:'flex', gap:4 }}>
                <span className={`status-badge status-${exp.status}`}>{exp.status}</span>
                <span className="badge" style={{ background:'var(--bg-secondary)', color:'var(--text-muted)' }}>v{exp.version}</span>
              </div>
              <button className="btn btn-sm btn-secondary w-full" style={{ marginTop:12 }} onClick={() => generateMethodology(exp)} disabled={generating===exp.id}>
                {generating===exp.id ? <><Loader size={12} style={{ animation:'spin 1s linear infinite' }}/> Generating...</> : <><Sparkles size={12}/> AI Generate Methodology</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
