'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Loader, Sparkles, Download, Trash2 } from 'lucide-react';

export default function PresentationsTab({ workspaceId }) {
  const [presentations, setPresentations] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState('');
  const [presType, setPresType] = useState('slides');
  const supabase = createClient();

  useEffect(() => { load(); loadPapers(); }, [workspaceId]);

  async function load() {
    const { data } = await supabase.from('presentations').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false });
    setPresentations(data || []);
    setLoading(false);
  }

  async function loadPapers() {
    const { data } = await supabase.from('papers').select('id, title').eq('workspace_id', workspaceId);
    setPapers(data || []);
  }

  async function generate() {
    setGenerating(true);
    try {
      const res = await fetch('/api/presentations/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId, paperId: selectedPaper || null, type: presType }) });
      if (res.ok) { const data = await res.json(); setPresentations(prev => [data, ...prev]); setActive(data); }
    } catch (err) { console.error(err); }
    setGenerating(false);
  }

  async function del(id) {
    await supabase.from('presentations').delete().eq('id', id);
    setPresentations(prev => prev.filter(p => p.id !== id));
    if (active?.id === id) setActive(null);
  }

  function exportHTML() {
    if (!active) return;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${active.title}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,sans-serif;background:#0a0b0f;color:#e2e8f0}.slide{width:100vw;height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:60px;text-align:center;page-break-after:always}.slide h2{font-size:2.5rem;margin-bottom:24px;background:linear-gradient(135deg,#818cf8,#2dd4bf);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.slide p,.slide li{font-size:1.2rem;color:#94a3b8;line-height:1.8;max-width:800px}.slide ul{list-style:none;text-align:left}.slide ul li::before{content:'→ ';color:#6366f1}@media print{.slide{page-break-after:always}}</style></head><body>
${(active.slides || []).map(s => `<div class="slide"><h2>${s.title || ''}</h2>${(s.points || []).length > 0 ? '<ul>' + s.points.map(p => `<li>${p}</li>`).join('') + '</ul>' : `<p>${s.content || ''}</p>`}</div>`).join('\n')}
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${active.title || 'presentation'}.html`; a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:48 }}><div className="spinner spinner-lg"/></div>;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div><h3 style={{ marginBottom:4 }}>Presentations</h3><p style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>Generate slides, posters, and viva prep from your research</p></div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <select className="input" value={presType} onChange={e => setPresType(e.target.value)} style={{ padding:'6px 10px', fontSize:'0.8rem', width:'auto' }}>
            <option value="slides">📊 Slides</option><option value="poster">🖼️ Poster</option><option value="viva">🎓 Viva Prep</option>
          </select>
          {papers.length > 0 && <select className="input" value={selectedPaper} onChange={e => setSelectedPaper(e.target.value)} style={{ padding:'6px 10px', fontSize:'0.8rem', width:'auto', maxWidth:200 }}>
            <option value="">From workspace context</option>{papers.map(p => <option key={p.id} value={p.id}>{p.title?.slice(0,30)}</option>)}
          </select>}
          <button className="btn btn-primary" onClick={generate} disabled={generating}>{generating ? <><Loader size={16} style={{ animation:'spin 1s linear infinite' }}/> Generating...</> : <><Sparkles size={16}/> Generate</>}</button>
        </div>
      </div>

      {active ? (
        <div>
          <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
            <button className="btn btn-sm btn-ghost" onClick={() => setActive(null)}>← Back</button>
            <button className="btn btn-sm btn-secondary" onClick={exportHTML}><Download size={14}/> Export HTML</button>
          </div>
          <h3 style={{ marginBottom:16 }}>{active.title}</h3>
          {active.slides?.length > 0 && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
              {active.slides.map((slide, i) => (
                <div key={i} className="slide-preview" style={{ alignItems:'flex-start', textAlign:'left', justifyContent:'flex-start', padding:20 }}>
                  <div style={{ fontSize:'0.7rem', color:'var(--accent-light)', marginBottom:8 }}>Slide {i+1}</div>
                  <div style={{ fontWeight:600, marginBottom:8, fontSize:'0.9rem' }}>{slide.title}</div>
                  {slide.points?.map((p, j) => <div key={j} style={{ fontSize:'0.75rem', color:'var(--text-secondary)', marginBottom:4 }}>→ {p}</div>)}
                  {slide.content && <p style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>{slide.content}</p>}
                </div>
              ))}
            </div>
          )}
          {active.speaker_notes?.length > 0 && (
            <div className="card" style={{ marginTop:24 }}>
              <h4 style={{ marginBottom:12 }}>🎤 Speaker Notes</h4>
              {active.speaker_notes.map((note, i) => <div key={i} style={{ padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:'0.85rem', color:'var(--text-secondary)' }}><strong>Slide {i+1}:</strong> {note}</div>)}
            </div>
          )}
          {active.viva_questions?.length > 0 && (
            <div className="card" style={{ marginTop:16 }}>
              <h4 style={{ marginBottom:12 }}>🎓 Viva Questions & Answers</h4>
              {active.viva_questions.map((qa, i) => <div key={i} style={{ padding:'12px 0', borderBottom:'1px solid var(--border)' }}><div style={{ fontWeight:600, fontSize:'0.85rem', marginBottom:4 }}>Q{i+1}: {qa.question}</div><div style={{ fontSize:'0.82rem', color:'var(--text-secondary)' }}>{qa.answer}</div></div>)}
            </div>
          )}
        </div>
      ) : presentations.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📊</div><h3>No presentations yet</h3><p>Generate slides, posters, or viva prep from your papers</p></div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {presentations.map(p => (
            <div key={p.id} className="project-card card-interactive" onClick={() => setActive(p)}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span className="badge badge-primary">{p.presentation_type}</span>
                <button className="btn btn-icon btn-ghost btn-sm" onClick={e => { e.stopPropagation(); del(p.id); }} style={{ color:'var(--rose)' }}><Trash2 size={12}/></button>
              </div>
              <h4>{p.title}</h4>
              <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:4 }}>{p.slides?.length || 0} slides</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
