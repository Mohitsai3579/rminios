'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Loader, Sparkles, Code, FolderTree, Map, Trash2 } from 'lucide-react';

const PROJECT_TYPES = [
  { value:'ai', label:'AI/ML', icon:'🤖' }, { value:'web', label:'Web App', icon:'🌐' },
  { value:'mobile', label:'Mobile', icon:'📱' }, { value:'iot', label:'IoT', icon:'📡' },
  { value:'data_science', label:'Data Science', icon:'📊' }, { value:'software', label:'Software', icon:'💻' },
  { value:'hardware', label:'Hardware', icon:'🔧' }, { value:'other', label:'Other', icon:'📦' },
];

export default function ProjectsTab({ workspaceId }) {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('ai');
  const [newDesc, setNewDesc] = useState('');
  const supabase = createClient();

  useEffect(() => { loadProjects(); }, [workspaceId]);

  async function loadProjects() {
    const { data } = await supabase.from('projects').select('*').eq('workspace_id', workspaceId).order('updated_at', { ascending: false });
    setProjects(data || []);
    setLoading(false);
  }

  async function createProject() {
    if (!newTitle.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('projects').insert({ workspace_id: workspaceId, user_id: user.id, title: newTitle, project_type: newType, description: newDesc }).select().single();
    if (data) { setProjects(prev => [data, ...prev]); setActiveProject(data); setShowCreate(false); setNewTitle(''); setNewDesc(''); }
  }

  async function generateArchitecture(project) {
    setGenerating(true);
    try {
      const res = await fetch('/api/projects/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ projectId: project.id, workspaceId, title: project.title, type: project.project_type, description: project.description }) });
      if (res.ok) { const data = await res.json(); const updated = { ...project, ...data }; setActiveProject(updated); setProjects(prev => prev.map(p => p.id === project.id ? updated : p)); }
    } catch (err) { console.error(err); }
    setGenerating(false);
  }

  async function deleteProject(id) {
    await supabase.from('projects').delete().eq('id', id);
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProject?.id === id) setActiveProject(null);
  }

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:48 }}><div className="spinner spinner-lg"/></div>;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div><h3 style={{ marginBottom:4 }}>Project Builder</h3><p style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>AI-generated architectures, roadmaps, and starter code</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={16}/> New Project</button>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Create Project</h3><button className="btn btn-icon btn-ghost" onClick={() => setShowCreate(false)}>✕</button></div>
            <div className="input-group" style={{ marginBottom:16 }}><label>Title</label><input className="input" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="My Research Project"/></div>
            <div className="input-group" style={{ marginBottom:16 }}><label>Type</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                {PROJECT_TYPES.map(t => <button key={t.value} className={`btn btn-sm ${newType===t.value?'btn-primary':'btn-secondary'}`} onClick={() => setNewType(t.value)}>{t.icon} {t.label}</button>)}
              </div>
            </div>
            <div className="input-group" style={{ marginBottom:16 }}><label>Description</label><textarea className="input" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Describe your project..." rows={3}/></div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button><button className="btn btn-primary" onClick={createProject} disabled={!newTitle.trim()}>Create</button></div>
          </div>
        </div>
      )}

      {projects.length === 0 && !showCreate ? (
        <div className="empty-state"><div className="empty-state-icon">🏗️</div><h3>No projects yet</h3><p>Create a project and let AI generate architecture, roadmaps, and code</p></div>
      ) : activeProject ? (
        <div>
          <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
            <button className="btn btn-sm btn-ghost" onClick={() => setActiveProject(null)}>← Back</button>
            <button className="btn btn-sm btn-primary" onClick={() => generateArchitecture(activeProject)} disabled={generating}>
              {generating ? <><Loader size={12} style={{ animation:'spin 1s linear infinite' }}/> Generating...</> : <><Sparkles size={12}/> AI Generate Architecture</>}
            </button>
          </div>
          <h3 style={{ marginBottom:4 }}>{PROJECT_TYPES.find(t => t.value === activeProject.project_type)?.icon} {activeProject.title}</h3>
          <p style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:24 }}>{activeProject.description}</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:16 }}>
            {activeProject.architecture?.overview && <div className="card"><h4 style={{ marginBottom:8 }}><Code size={16}/> Architecture</h4><pre style={{ fontSize:'0.8rem', whiteSpace:'pre-wrap', color:'var(--text-secondary)' }}>{typeof activeProject.architecture.overview === 'string' ? activeProject.architecture.overview : JSON.stringify(activeProject.architecture.overview, null, 2)}</pre></div>}
            {activeProject.folder_structure && <div className="card"><h4 style={{ marginBottom:8 }}><FolderTree size={16}/> Folder Structure</h4><pre style={{ fontSize:'0.8rem', whiteSpace:'pre-wrap', color:'var(--text-secondary)' }}>{activeProject.folder_structure}</pre></div>}
            {activeProject.roadmap?.length > 0 && <div className="card"><h4 style={{ marginBottom:8 }}><Map size={16}/> Roadmap</h4>{activeProject.roadmap.map((step,i) => <div key={i} style={{ padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:'0.85rem' }}><span className="badge badge-primary" style={{ marginRight:8 }}>Phase {i+1}</span>{typeof step === 'string' ? step : step.title || step.phase}</div>)}</div>}
            {activeProject.tech_stack?.length > 0 && <div className="card"><h4 style={{ marginBottom:8 }}>Tech Stack</h4><div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>{activeProject.tech_stack.map((t,i) => <span key={i} className="badge badge-teal">{t}</span>)}</div></div>}
            {activeProject.documentation && <div className="card"><h4 style={{ marginBottom:8 }}>Documentation</h4><pre style={{ fontSize:'0.8rem', whiteSpace:'pre-wrap', color:'var(--text-secondary)' }}>{activeProject.documentation}</pre></div>}
            {activeProject.starter_code && <div className="card"><h4 style={{ marginBottom:8 }}>Starter Code</h4><pre style={{ fontSize:'0.8rem', whiteSpace:'pre-wrap', color:'var(--text-secondary)', background:'var(--bg-primary)', padding:12, borderRadius:'var(--radius-sm)', overflowX:'auto' }}>{activeProject.starter_code}</pre></div>}
          </div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
          {projects.map(p => (
            <div key={p.id} className="project-card card-interactive" onClick={() => setActiveProject(p)}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:'1.2rem' }}>{PROJECT_TYPES.find(t => t.value === p.project_type)?.icon}</span>
                <div style={{ display:'flex', gap:4 }}>
                  <span className={`status-badge status-${p.status}`}>{p.status}</span>
                  <button className="btn btn-icon btn-ghost btn-sm" onClick={e => { e.stopPropagation(); deleteProject(p.id); }} style={{ color:'var(--rose)' }}><Trash2 size={12}/></button>
                </div>
              </div>
              <h4>{p.title}</h4>
              <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', marginTop:4 }}>{p.description?.slice(0,100) || 'No description'}</p>
              {p.tech_stack?.length > 0 && <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:8 }}>{p.tech_stack.slice(0,4).map((t,i) => <span key={i} className="badge badge-teal" style={{ fontSize:'0.65rem' }}>{t}</span>)}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
