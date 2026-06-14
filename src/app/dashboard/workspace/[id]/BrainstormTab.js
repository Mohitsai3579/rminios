'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Brain, Loader, Sparkles, Star, Zap, Target, RefreshCw, StickyNote, Trash2, Copy, FileText } from 'lucide-react';

export default function BrainstormTab({ workspaceId, onGeneratePaper }) {
  const [brainstorms, setBrainstorms] = useState([]);
  const [activeBrainstorm, setActiveBrainstorm] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Precision PDF Selection
  const [files, setFiles] = useState([]);
  const [selectedFileIds, setSelectedFileIds] = useState([]);
  
  const supabase = createClient();

  useEffect(() => { 
    loadBrainstorms(); 
    loadFiles();
  }, [workspaceId]);

  async function loadFiles() {
    const { data } = await supabase.from('files').select('id, name').eq('workspace_id', workspaceId).eq('processing_status', 'ready');
    if (data) {
      setFiles(data);
      setSelectedFileIds(data.map(f => f.id)); // Default select all
    }
  }

  async function loadBrainstorms() {
    const { data } = await supabase.from('brainstorms').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false });
    setBrainstorms(data || []);
    if (data?.length > 0) setActiveBrainstorm(data[0]);
    setLoading(false);
  }

  async function generateBrainstorm() {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, selectedFileIds }),
      });
      if (res.ok) {
        const data = await res.json();
        loadBrainstorms();
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || 'Brainstorm generation failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
    }
    setGenerating(false);
  }

  async function saveAsNote(title, content, type = 'idea') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('notes').insert({ 
        workspace_id: workspaceId, 
        user_id: user.id, 
        title: title, 
        content: content,
        note_type: type,
        is_pinned: false
      });
      if (error) throw error;
      alert(`Successfully saved "${title}" to your Notes!`);
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note: " + error.message);
    }
  }

  async function clearBrainstorms() {
    if (!confirm('Are you sure you want to clear all brainstorm sessions?')) return;
    setLoading(true);
    await supabase.from('brainstorms').delete().eq('workspace_id', workspaceId);
    setBrainstorms([]);
    setActiveBrainstorm(null);
    setLoading(false);
  }

  const ideas = activeBrainstorm?.ideas || [];
  const gaps = activeBrainstorm?.gaps || [];
  const themes = activeBrainstorm?.themes || [];

  const filteredIdeas = filter === 'all' ? ideas
    : filter === 'high' ? ideas.filter(i => i.novelty_score >= 7)
    : filter === 'medium' ? ideas.filter(i => i.novelty_score >= 4 && i.novelty_score < 7)
    : ideas.filter(i => i.novelty_score < 4);

  const difficultyColor = (d) => d === 'beginner' ? 'badge-green' : d === 'intermediate' ? 'badge-amber' : 'badge-rose';
  const noveltyClass = (s) => s >= 7 ? 'novelty-high' : s >= 4 ? 'novelty-medium' : 'novelty-low';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <h3 style={{ marginBottom: 4 }}>Brainstorming Engine</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>AI analyzes your papers to generate research ideas and discover gaps</p>
          
          {/* PDF Context Selector */}
          <div style={{ marginTop: 16, background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', maxWidth: 400 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Context Source (Select PDFs)</div>
            {files.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No PDFs uploaded yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 120, overflowY: 'auto' }}>
                {files.map(f => (
                  <label key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedFileIds.includes(f.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedFileIds(prev => [...prev, f.id]);
                        else setSelectedFileIds(prev => prev.filter(id => id !== f.id));
                      }}
                      style={{ accentColor: 'var(--accent)' }}
                    />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>{f.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          {activeBrainstorm && (
            <button className="btn btn-ghost" onClick={clearBrainstorms} disabled={loading || generating} title="Clear Session" style={{ color: 'var(--rose)' }}>
              <Trash2 size={16} />
            </button>
          )}
          <button className="btn btn-primary" onClick={generateBrainstorm} disabled={generating || selectedFileIds.length === 0}>
            {generating ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</> : activeBrainstorm ? <><RefreshCw size={16} /> Regenerate Ideas</> : <><Sparkles size={16} /> Generate Ideas</>}
          </button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ padding: 16, marginBottom: 16, borderColor: 'var(--rose)', background: 'rgba(244,63,94,0.08)' }}>
          <p style={{ color: 'var(--rose)', fontSize: '0.85rem' }}>⚠️ {error}</p>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 200 }} />)}
        </div>
      ) : !activeBrainstorm ? (
        <div className="empty-state">
          <div className="empty-state-icon">🧠</div>
          <h3>No brainstorm sessions yet</h3>
          <p>Upload papers first, then click &quot;Generate Ideas&quot; to let AI analyze your research and suggest novel directions.</p>
        </div>
      ) : (
        <>
          {/* Themes */}
          {themes.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><Target size={16} style={{ color: 'var(--teal)' }} /> Common Themes</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {themes.map((t, i) => <span key={i} className="badge badge-teal">{typeof t === 'string' ? t : t.name || t.theme}</span>)}
              </div>
            </div>
          )}

          {/* Research Gaps */}
          {gaps.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><Zap size={16} style={{ color: 'var(--amber)' }} /> Research Gaps Discovered</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
                {gaps.map((g, i) => (
                  <div key={i} className="card" style={{ padding: 16, position: 'relative', paddingRight: 40 }}>
                    <button className="btn btn-icon btn-ghost btn-sm" style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, padding: 0 }} onClick={() => saveAsNote(g.area || g.topic || `Gap ${i+1}`, g.description || g.opportunity, 'finding')} title="Save as Note">
                      <StickyNote size={14} />
                    </button>
                    <div style={{ fontWeight: 600, marginBottom: 4, fontSize: '0.9rem' }}>{g.area || g.topic || `Gap ${i+1}`}</div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{g.description || g.opportunity}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 12 }}><Star size={16} style={{ color: 'var(--accent-light)' }} /> Research Ideas ({ideas.length})</h4>
            {['all', 'high', 'medium', 'low'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f === 'high' ? '🔥 High Novelty' : f === 'medium' ? '⚡ Medium' : '📌 Low'}
              </button>
            ))}
          </div>

          {/* Ideas Grid */}
          <div className="brainstorm-grid">
            {filteredIdeas.map((idea, i) => (
              <div key={i} className="idea-card" style={{ position: 'relative', paddingRight: 70 }}>
                <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 4 }}>
                  <button className="btn btn-icon btn-ghost btn-sm" style={{ width: 28, height: 28, padding: 0 }} onClick={() => onGeneratePaper(idea)} title="Generate Paper">
                    <FileText size={14} style={{ color: 'var(--accent)' }} />
                  </button>
                  <button className="btn btn-icon btn-ghost btn-sm" style={{ width: 28, height: 28, padding: 0 }} onClick={() => saveAsNote(idea.title || `Idea ${i+1}`, idea.description, 'idea')} title="Save as Note">
                    <StickyNote size={14} />
                  </button>
                </div>
                <div className="idea-title" style={{ paddingRight: 40 }}>{idea.title || `Idea ${i+1}`}</div>
                <div className="idea-description">{idea.description}</div>
                <div className="idea-meta">
                  {idea.difficulty && <span className={`badge ${difficultyColor(idea.difficulty)}`}>{idea.difficulty}</span>}
                  {idea.novelty_score && <span className="badge badge-primary">Novelty: {idea.novelty_score}/10</span>}
                </div>
                {idea.novelty_score && (
                  <div className="novelty-bar">
                    <div className={`novelty-fill ${noveltyClass(idea.novelty_score)}`} style={{ width: `${idea.novelty_score * 10}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
