'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Pin, Search, Tag, Trash2, Loader, Sparkles, StickyNote, Download } from 'lucide-react';

const NOTE_TYPES = [
  { value: 'general', label: 'General', icon: '📝' },
  { value: 'finding', label: 'Finding', icon: '🔍' },
  { value: 'idea', label: 'Idea', icon: '💡' },
  { value: 'observation', label: 'Observation', icon: '👁️' },
  { value: 'question', label: 'Question', icon: '❓' },
  { value: 'method', label: 'Method', icon: '🧪' },
];

export default function NotesTab({ workspaceId }) {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [generatingOverview, setGeneratingOverview] = useState(false);
  const supabase = createClient();

  useEffect(() => { loadNotes(); }, [workspaceId]);

  async function loadNotes() {
    const { data } = await supabase.from('notes').select('*').eq('workspace_id', workspaceId).order('is_pinned', { ascending: false }).order('updated_at', { ascending: false });
    setNotes(data || []);
    setLoading(false);
  }

  async function createNote() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.from('notes').insert({ 
        workspace_id: workspaceId, 
        user_id: user.id, 
        title: 'Untitled Note', 
        content: '',
        note_type: 'general',
        is_pinned: false
      }).select().single();
      
      if (error) throw error;
      if (data) { 
        setNotes(prev => [data, ...prev]); 
        setActiveNote(data); 
      }
    } catch (error) {
      console.error("Error creating note:", error);
      alert("Failed to create note: " + error.message);
    }
  }

  async function saveNote() {
    if (!activeNote) return;
    setSaving(true);
    await supabase.from('notes').update({ title: activeNote.title, content: activeNote.content, tags: activeNote.tags, note_type: activeNote.note_type, is_pinned: activeNote.is_pinned, updated_at: new Date().toISOString() }).eq('id', activeNote.id);
    setNotes(prev => prev.map(n => n.id === activeNote.id ? activeNote : n));
    setSaving(false);
  }

  async function deleteNote(id) {
    await supabase.from('notes').delete().eq('id', id);
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNote?.id === id) setActiveNote(null);
  }

  async function togglePin(note) {
    const updated = { ...note, is_pinned: !note.is_pinned };
    await supabase.from('notes').update({ is_pinned: updated.is_pinned }).eq('id', note.id);
    setNotes(prev => prev.map(n => n.id === note.id ? updated : n));
    if (activeNote?.id === note.id) setActiveNote(updated);
  }

  async function summarizeNote() {
    if (!activeNote?.content) return;
    setSummarizing(true);
    try {
      const res = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: `Summarize this research note concisely:\n\n${activeNote.content}`, workspaceId, role: 'mentor' }) });
      if (res.ok) {
        const text = await res.text();
        setActiveNote(prev => ({ ...prev, content: prev.content + '\n\n---\n**AI Summary:**\n' + text }));
      }
    } catch (err) { console.error(err); }
    setSummarizing(false);
  }

  async function generateAIOverview() {
    setGeneratingOverview(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: note, error: insertError } = await supabase.from('notes').insert({ 
        workspace_id: workspaceId, 
        user_id: user.id, 
        title: 'AI Papers Overview', 
        content: 'Generating overview...',
        note_type: 'general',
        is_pinned: true
      }).select().single();
      
      if (insertError) throw insertError;
      
      setNotes(prev => [note, ...prev]);
      setActiveNote(note);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: 'Generate a comprehensive overview of all uploaded research papers. Include main themes, methodologies, and key findings. Format it clearly using markdown.', 
          workspaceId, 
          history: [] 
        }),
      });

      if (!res.ok) throw new Error('Failed to generate overview');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setActiveNote(prev => ({ ...prev, content: fullText }));
      }

      await supabase.from('notes').update({ content: fullText }).eq('id', note.id);
      setNotes(prev => prev.map(n => n.id === note.id ? { ...n, content: fullText } : n));
      
    } catch (err) {
      console.error(err);
      alert('Error generating overview: ' + err.message);
    }
    setGeneratingOverview(false);
  }

  const downloadNote = () => {
    if (!activeNote) return;
    const element = document.createElement("a");
    const file = new Blob([activeNote.content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${activeNote.title || 'Note'}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filtered = notes.filter(n => {
    if (filterType !== 'all' && n.note_type !== filterType) return false;
    if (search && !n.title?.toLowerCase().includes(search.toLowerCase()) && !n.content?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner spinner-lg" /></div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: activeNote ? '320px 1fr' : '1fr', gap: 0, height: 'calc(100vh - 220px)' }}>
      {/* Notes List */}
      <div style={{ borderRight: activeNote ? '1px solid var(--border)' : 'none', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px', display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input w-full" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." style={{ paddingLeft: 32, fontSize: '0.8rem' }} />
          </div>
          <button className="btn btn-secondary btn-sm" onClick={generateAIOverview} title="Generate AI Overview" disabled={generatingOverview}>
            {generatingOverview ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
          </button>
          <button className="btn btn-primary btn-sm" onClick={createNote} title="New Note"><Plus size={14} /></button>
        </div>
        <div style={{ padding: '0 12px 8px', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <button className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilterType('all')} style={{ fontSize: '0.7rem' }}>All</button>
          {NOTE_TYPES.map(t => <button key={t.value} className={`btn btn-sm ${filterType === t.value ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilterType(t.value)} style={{ fontSize: '0.7rem' }}>{t.icon}</button>)}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px' }}>
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}><StickyNote size={32} style={{ opacity: 0.3 }} /><p style={{ fontSize: '0.8rem', marginTop: 8 }}>No notes yet</p></div>
          ) : filtered.map(n => (
            <div key={n.id} className={`note-card ${n.is_pinned ? 'pinned' : ''}`} onClick={() => setActiveNote(n)} style={{ marginBottom: 8, ...(activeNote?.id === n.id ? { borderColor: 'var(--accent)' } : {}) }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{NOTE_TYPES.find(t => t.value === n.note_type)?.icon} {n.title || 'Untitled'}</span>
                {n.is_pinned && <Pin size={12} style={{ color: 'var(--amber)', flexShrink: 0 }} />}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.content?.slice(0, 80) || 'Empty note'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      {activeNote && (
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select className="input" value={activeNote.note_type} onChange={e => setActiveNote(p => ({ ...p, note_type: e.target.value }))} style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}>
                {NOTE_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
              </select>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => togglePin(activeNote)} title="Pin"><Pin size={14} style={{ color: activeNote.is_pinned ? 'var(--amber)' : 'var(--text-muted)' }} /></button>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-sm btn-ghost" onClick={downloadNote} title="Download"><Download size={12} /></button>
              <button className="btn btn-sm btn-ghost" onClick={summarizeNote} disabled={summarizing}>{summarizing ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={12} />} Summarize</button>
              <button className="btn btn-sm btn-ghost" onClick={() => deleteNote(activeNote.id)} style={{ color: 'var(--rose)' }}><Trash2 size={12} /></button>
              <button className="btn btn-sm btn-primary" onClick={saveNote} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
          <input type="text" value={activeNote.title} onChange={e => setActiveNote(p => ({ ...p, title: e.target.value }))} placeholder="Note title..." style={{ padding: '12px 16px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600, outline: 'none', fontFamily: 'inherit' }} />
          <textarea value={activeNote.content} onChange={e => setActiveNote(p => ({ ...p, content: e.target.value }))} placeholder="Start writing..." style={{ flex: 1, padding: 16, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.8, outline: 'none', resize: 'none', fontFamily: 'inherit' }} />
        </div>
      )}
    </div>
  );
}
