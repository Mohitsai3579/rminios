'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Plus, FolderOpen, FileText, MessageSquare, Brain, ArrowRight, Zap, Cloud, Clock, Trash2, Bot, Code2, Sparkles, TrendingUp, Radio, Award, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const [workspaces, setWorkspaces] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [stats, setStats] = useState({ total: 0, papers: 0, chats: 0, ideas: 0, storageUsed: 0 });
  const [workspaceStats, setWorkspaceStats] = useState({});
  const supabase = createClient();

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  useEffect(() => { loadDashboardData(); }, []);

  async function loadDashboardData() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return; // Prevent errors during logout transitions
    
    // Load workspaces
    const { data: wsData } = await supabase.from('workspaces').select('*').order('updated_at', { ascending: false });
    
    // Load recent files across all workspaces
    const { data: recentFiles } = await supabase.from('files')
      .select('id, name, created_at, workspace_id, workspaces!inner(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Load global counts
    const { count: papersCount } = await supabase.from('files').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    const { count: chatsCount } = await supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    const { count: ideasCount } = await supabase.from('brainstorms').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    
    // Calculate actual storage dynamically from files and datasets
    const [filesSizeRes, datasetsSizeRes] = await Promise.all([
      supabase.from('files').select('file_size, extracted_text').eq('user_id', user.id),
      supabase.from('datasets').select('size_bytes').eq('user_id', user.id)
    ]);
    
    let totalBytes = 0;
    filesSizeRes.data?.forEach(f => {
      totalBytes += (f.file_size || (f.extracted_text ? f.extracted_text.length * 1.2 : 300000));
    });
    datasetsSizeRes.data?.forEach(d => {
      totalBytes += (d.size_bytes || 0);
    });
    const storageUsedMb = (totalBytes / (1024 * 1024)).toFixed(1);

    setStats({
      total: wsData?.length || 0,
      papers: papersCount || 0,
      chats: chatsCount || 0,
      ideas: ideasCount || 0,
      storageUsed: parseFloat(storageUsedMb)
    });

    setWorkspaces(wsData || []);
    setRecentFiles(recentFiles || []);

    // Load per-workspace stats
    if (wsData && wsData.length > 0) {
      const wsIds = wsData.map(w => w.id);
      const [filesRes, convsRes] = await Promise.all([
        supabase.from('files').select('workspace_id').in('workspace_id', wsIds),
        supabase.from('conversations').select('workspace_id').in('workspace_id', wsIds)
      ]);
      
      const wsStatsMap = {};
      wsIds.forEach(id => {
        wsStatsMap[id] = {
          papers: filesRes.data?.filter(f => f.workspace_id === id).length || 0,
          chats: convsRes.data?.filter(c => c.workspace_id === id).length || 0
        };
      });
      setWorkspaceStats(wsStatsMap);
    }

    setLoading(false);
  }

  async function createWorkspace(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);

    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('workspaces').insert({
      name: newName,
      description: newDesc,
      user_id: user.id
    }).select().single();

    if (!error && data) {
      setWorkspaces([data, ...workspaces]);
      setShowCreate(false);
      setNewName('');
      setNewDesc('');
    } else if (error) {
      alert(`Failed to create workspace: ${error.message}`);
      console.error(error);
    }
    setCreating(false);
  }

  async function deleteWorkspace(id, e) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this workspace and all its contents?')) return;
    
    try {
      const res = await fetch(`/api/workspaces/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setWorkspaces(workspaces.filter(ws => ws.id !== id));
      } else {
        alert('Failed to delete workspace.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting workspace.');
    }
  }

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><div className="spinner spinner-lg" /></div>;
  }

  return (
    <>
      <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>Research Hub</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>Welcome back. Here is a summary of your academic progress.</p>
        </div>
      </div>

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Quick Action Widget & Innovation Highlights */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn btn-primary btn-3d" onClick={() => setShowCreate(true)} style={{ padding: '12px 24px', fontWeight: 700 }}>
            <Plus size={18} /> New Workspace
          </button>
          {workspaces.length > 0 && (
            <Link href={`/dashboard/workspace/${workspaces[0].id}`} className="btn btn-secondary btn-3d" style={{ padding: '12px 24px', background: 'var(--bg-tertiary)' }}>
              <Zap size={18} style={{ color: 'var(--amber)' }} /> Jump to Recent Workspace
            </Link>
          )}
        </div>

        {/* Real-World Innovation Hub - 4 Primary Platform Modules */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Sparkles size={18} style={{ color: 'var(--accent)' }} />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>Autonomous Innovation & Research Engines</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <Link 
              href="/dashboard/codestudio" 
              className="card card-3d card-spotlight" 
              onMouseMove={handleMouseMove}
              style={{ textDecoration: 'none', color: 'inherit', border: '1px solid rgba(99, 102, 241, 0.3)', background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(26,27,38,0.7))', padding: 20 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Code2 size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>Antigravity Code Studio</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent)' }}>Autonomous Developer Agent</div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Multi-file project generation, PyTorch models, live sandbox testing, and architecture synthesis.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--accent)', marginTop: 12, fontWeight: 600 }}>
                Launch Studio <ArrowRight size={13} />
              </div>
            </Link>

            <Link 
              href="/dashboard/swarm" 
              className="card card-3d card-spotlight" 
              onMouseMove={handleMouseMove}
              style={{ textDecoration: 'none', color: 'inherit', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(26,27,38,0.7))', padding: 20 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16, 185, 129, 0.2)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>Global Swarm Arena</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--green)' }}>4-Agent Heterogeneous Fleet</div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Literature gap, PyTorch architecture, adversarial ablations, and NeurIPS peer-reviewing.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--green)', marginTop: 12, fontWeight: 600 }}>
                Enter Swarm <ArrowRight size={13} />
              </div>
            </Link>

            <Link 
              href="/dashboard/impact" 
              className="card card-3d card-spotlight" 
              onMouseMove={handleMouseMove}
              style={{ textDecoration: 'none', color: 'inherit', border: '1px solid rgba(168, 85, 247, 0.3)', background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(26,27,38,0.7))', padding: 20 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>Impact & Patent Lab</div>
                  <div style={{ fontSize: '0.72rem', color: '#c084fc' }}>Research Commercialization</div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Convert hypotheses into legal patent claim outlines, market TAM/SAM/SOM, and NSF grants.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#c084fc', marginTop: 12, fontWeight: 600 }}>
                Explore Lab <ArrowRight size={13} />
              </div>
            </Link>

            <Link 
              href="/dashboard/radar" 
              className="card card-3d card-spotlight" 
              onMouseMove={handleMouseMove}
              style={{ textDecoration: 'none', color: 'inherit', border: '1px solid rgba(245, 158, 11, 0.3)', background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(26,27,38,0.7))', padding: 20 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245, 158, 11, 0.2)', color: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Radio size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>Global Literature Radar</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--amber)' }}>Live ArXiv & bioRxiv Feed</div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Streaming global pre-prints with automated citation trend analysis and AI clustering.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--amber)', marginTop: 12, fontWeight: 600 }}>
                Open Radar <ArrowRight size={13} />
              </div>
            </Link>

            <Link 
              href="/dashboard/grants" 
              className="card card-3d card-spotlight" 
              onMouseMove={handleMouseMove}
              style={{ textDecoration: 'none', color: 'inherit', border: '1px solid rgba(34, 197, 94, 0.3)', background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(26,27,38,0.7))', padding: 20 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>Grants & Funding Radar</div>
                  <div style={{ fontSize: '0.72rem', color: '#22c55e' }}>NSF, NIH & EIC Matching</div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Autonomous non-dilutive research grant proposal package and milestone synthesizer.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#22c55e', marginTop: 12, fontWeight: 600 }}>
                Explore Grants <ArrowRight size={13} />
              </div>
            </Link>

            <Link 
              href="/dashboard/integrity" 
              className="card card-3d card-spotlight" 
              onMouseMove={handleMouseMove}
              style={{ textDecoration: 'none', color: 'inherit', border: '1px solid rgba(45, 212, 191, 0.3)', background: 'linear-gradient(135deg, rgba(45,212,191,0.08), rgba(26,27,38,0.7))', padding: 20 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(45, 212, 191, 0.2)', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>Scientific Integrity Shield</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--teal)' }}>Hallucination & DOI Defense</div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Real-time CrossRef and ArXiv citation verification to prevent synthetic paper retractions.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--teal)', marginTop: 12, fontWeight: 600 }}>
                Audit Integrity <ArrowRight size={13} />
              </div>
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          
          {/* Main Stat Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card card-3d card-spotlight" onMouseMove={handleMouseMove} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ padding: 16, background: 'rgba(99,102,241,0.1)', color: 'var(--accent)', borderRadius: '50%' }}>
                <FileText size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{stats.papers}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Documents Processed</div>
              </div>
            </div>
            
            <div className="card card-3d card-spotlight" onMouseMove={handleMouseMove} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ padding: 16, background: 'rgba(16,185,129,0.1)', color: 'var(--emerald)', borderRadius: '50%' }}>
                <MessageSquare size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{stats.chats}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AI Chat Sessions</div>
              </div>
            </div>

            <div className="card card-3d card-spotlight" onMouseMove={handleMouseMove} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ padding: 16, background: 'rgba(168,85,247,0.1)', color: 'var(--purple)', borderRadius: '50%' }}>
                <Brain size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{stats.ideas}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Brainstorms Run</div>
              </div>
            </div>
          </div>

          {/* Cloud Quota Widget */}
          <div className="card card-3d card-spotlight" onMouseMove={handleMouseMove} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <Cloud size={18} style={{ color: 'var(--blue)' }} /> Storage & API Quota
            </h4>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Vector Storage Used</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{stats.storageUsed.toFixed(1)} MB / 200 MB</span>
              </div>
              <div style={{ width: '100%', height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(stats.storageUsed / 200) * 100}%`, background: 'var(--blue)' }} />
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Your account is currently on the Free Tier. Storage includes multimodal PDF embeddings and RAG cache.
            </p>
          </div>

          {/* Recent Activity Radar */}
          <div className="card card-3d card-spotlight" onMouseMove={handleMouseMove} style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 2 }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <Clock size={18} style={{ color: 'var(--amber)' }} /> Recent Uploads
            </h4>
            {recentFiles.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No recent files uploaded.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recentFiles.map(file => (
                  <div key={file.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        in {file.workspaces?.name || 'Workspace'} • {new Date(file.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Link href={`/dashboard/workspace/${file.workspace_id}`} className="btn btn-icon" style={{ flexShrink: 0 }}>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Workspaces Grid */}
        <div>
          <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FolderOpen size={20} /> Your Workspaces
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {workspaces.map(ws => (
              <Link 
                key={ws.id} 
                href={`/dashboard/workspace/${ws.id}`} 
                className="card card-3d card-spotlight" 
                onMouseMove={handleMouseMove}
                style={{ textDecoration: 'none', color: 'inherit', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <div>
                  <h4 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{ws.name} <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} /></span>
                    <button onClick={(e) => deleteWorkspace(ws.id, e)} className="btn btn-icon" style={{ padding: 4, background: 'rgba(244,63,94,0.1)', color: 'var(--rose)', border: 'none' }} title="Delete Workspace">
                      <Trash2 size={16} />
                    </button>
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{ws.description || 'No description'}</p>
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <FileText size={14} /> {workspaceStats[ws.id]?.papers || 0} Papers
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <MessageSquare size={14} /> {workspaceStats[ws.id]?.chats || 0} Chats
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {showCreate && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginTop: 0 }}>Create Workspace</h3>
            <form onSubmit={createWorkspace}>
              <div className="input-group">
                <label>Name</label>
                <input type="text" className="input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Masters Thesis" autoFocus required />
              </div>
              <div className="input-group" style={{ marginTop: 16 }}>
                <label>Description (Optional)</label>
                <textarea className="input" rows="3" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What is this workspace for?" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating || !newName.trim()}>
                  {creating ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
