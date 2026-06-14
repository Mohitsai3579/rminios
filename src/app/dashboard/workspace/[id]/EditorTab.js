'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, FileText, Trash2, Sparkles, Loader, Save, BookOpen, ChevronDown, ChevronUp, Download, X, FileUp, Globe, Search } from 'lucide-react';
import { CITATION_STYLES } from '@/lib/citations';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

const SECTIONS = [
  { type: 'title', label: 'Title' },
  { type: 'abstract', label: 'Abstract' },
  { type: 'introduction', label: 'Introduction' },
  { type: 'literature_review', label: 'Literature Review' },
  { type: 'methodology', label: 'Methodology' },
  { type: 'results', label: 'Results & Discussion' },
  { type: 'conclusion', label: 'Conclusion' },
  { type: 'references', label: 'References' },
];

export default function EditorTab({ workspaceId, pendingIdea, clearPendingIdea }) {
  const [papers, setPapers] = useState([]);
  const [activePaper, setActivePaper] = useState(null);
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [generatingSection, setGeneratingSection] = useState(null);
  
  // Web Search State
  const [showWebSearch, setShowWebSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Advanced Generation State
  const [formatInputType, setFormatInputType] = useState('text');
  const [formatText, setFormatText] = useState('');
  const [formatFile, setFormatFile] = useState(null);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [citationStyle, setCitationStyle] = useState('apa');
  const [exportFormat, setExportFormat] = useState('ieee');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { loadPapers(); }, [workspaceId]);

  async function loadPapers() {
    const { data } = await supabase.from('papers').select('*').eq('workspace_id', workspaceId).order('updated_at', { ascending: false });
    setPapers(data || []);
    if (data?.length > 0 && !activePaper) selectPaper(data[0]);
    setLoading(false);
  }

  function selectPaper(paper) {
    setActivePaper(paper);
    const paperSections = paper.sections || SECTIONS.map((s, i) => ({ id: `sec-${i}`, type: s.type, title: s.label, content: '', order: i }));
    setSections(paperSections);
    setCitationStyle(paper.citation_style || 'apa');
  }

  const handleFormatUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormatFile(file);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/papers/parse-template', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setFormatText(data.text || `Format provided via template: ${file.name}`);
      } else {
        alert('Failed to extract text from template file. Please try a simpler PDF or text file.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while parsing template file.');
    }
  };

  const startAutoGeneration = async () => {
    setAutoGenerating(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    let initialSections = SECTIONS.map((s, i) => ({ id: `sec-${i}`, type: s.type, title: s.label, content: '', order: i }));
    
    try {
      const structRes = await fetch('/api/papers/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          paperIdea: pendingIdea ? `Title: ${pendingIdea.title}\nDescription: ${pendingIdea.description}` : '', 
          paperFormat: formatText 
        })
      });
      if (structRes.ok) {
        const structData = await structRes.json();
        if (structData.sections && structData.sections.length > 0) {
          initialSections = structData.sections;
        }
      }
    } catch(e) { console.error('Failed to get structure', e); }

    const { data: newPaper } = await supabase.from('papers').insert({
      workspace_id: workspaceId, user_id: user.id, title: pendingIdea?.title || 'Generated Paper',
      sections: initialSections, citation_style: 'apa',
    }).select().single();
    
    if (newPaper) {
      setPapers(prev => [newPaper, ...prev]);
      selectPaper({ ...newPaper, sections: initialSections });
      
      const formatInstructions = formatText.trim() ? `\n\nFORMATTING CONSTRAINTS:\n${formatText}` : '';
      const ideaContext = pendingIdea ? `\n\nCORE IDEA TO IMPLEMENT:\nTitle: ${pendingIdea.title}\nDescription: ${pendingIdea.description}` : '';

      const updatedSections = [...initialSections];
      
      for (const section of initialSections) {
        // Skip AI generation for title, set it directly from pendingIdea
        if (section.type === 'title') {
          const idx = updatedSections.findIndex(s => s.id === section.id);
          if (idx > -1) updatedSections[idx].content = pendingIdea?.title || 'Generated Paper';
          setSections([...updatedSections]);
          continue;
        }

        setGeneratingSection(section.id);
        try {
          const res = await fetch('/api/papers/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              workspaceId, 
              sectionType: section.type, 
              sectionTitle: section.title,
              paperTitle: pendingIdea?.title || 'Generated Paper', 
              citationStyle: 'apa',
              paperIdea: ideaContext,
              paperFormat: formatInstructions
            }),
          });
          if (res.ok) {
            const { content } = await res.json();
            const idx = updatedSections.findIndex(s => s.id === section.id);
            if (idx > -1) updatedSections[idx].content = content;
            setSections([...updatedSections]);
          }
        } catch (err) { console.error(err); }
      }
      
      setGeneratingSection(null);
      await supabase.from('papers').update({ sections: updatedSections }).eq('id', newPaper.id);
    }
    
    setAutoGenerating(false);
    clearPendingIdea?.();
  };

  async function createPaper() {
    const { data: { user } } = await supabase.auth.getUser();
    const defaultSections = SECTIONS.map((s, i) => ({ id: `sec-${i}`, type: s.type, title: s.label, content: '', order: i }));
    const { data } = await supabase.from('papers').insert({
      workspace_id: workspaceId, user_id: user.id, title: 'Untitled Paper',
      sections: defaultSections, citation_style: 'apa',
    }).select().single();
    if (data) { setPapers(prev => [data, ...prev]); selectPaper(data); }
  }

  async function savePaper() {
    if (!activePaper) return;
    setSaving(true);
    const title = sections.find(s => s.type === 'title')?.content || 'Untitled Paper';
    const wordCount = sections.reduce((acc, s) => acc + (s.content?.split(/\s+/).filter(Boolean).length || 0), 0);
    await supabase.from('papers').update({ title, sections, citation_style: citationStyle, word_count: wordCount, updated_at: new Date().toISOString() }).eq('id', activePaper.id);
    setSaving(false);
  }

  function updateSection(sectionId, content) {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, content } : s));
  }

  async function generateSection(section) {
    setGeneratingSection(section.id);
    try {
      const res = await fetch('/api/papers/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          workspaceId, 
          sectionType: section.type, 
          sectionTitle: section.title,
          paperTitle: sections.find(s => s.type === 'title')?.content || '', 
          citationStyle 
        }),
      });
      if (res.ok) {
        const { content } = await res.json();
        updateSection(section.id, content);
      }
    } catch (err) { console.error(err); }
    setGeneratingSection(null);
  }

  async function handleCopilot(e) {
    e.preventDefault();
    if (!copilotInput.trim() || !activeSection) return;
    setCopilotLoading(true);
    try {
      const currentContent = sections.find(s => s.id === activeSection)?.content || '';
      const res = await fetch('/api/papers/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: copilotInput, currentContent, workspaceId, citationStyle }),
      });
      if (res.ok) {
        const { content } = await res.json();
        updateSection(activeSection, content);
        setCopilotInput('');
      }
    } catch (err) { console.error(err); }
    setCopilotLoading(false);
  }

  async function deletePaper(paperId) {
    if (!confirm('Are you sure you want to delete this paper?')) return;
    await supabase.from('papers').delete().eq('id', paperId);
    setPapers(prev => prev.filter(p => p.id !== paperId));
    if (activePaper?.id === paperId) { setActivePaper(null); setSections([]); }
  }

  async function handleWebSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim() || searchLoading) return;
    setSearchLoading(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch(err) { console.error(err); }
    setSearchLoading(false);
  }

  async function exportPaper() {
    if (!activePaper) return;
    
    const isIEEE = exportFormat === 'ieee';
    const children = [];
    
    sections.forEach(s => {
      if (s.type === 'title') {
        children.push(new Paragraph({
          text: s.content || 'Untitled Paper',
          heading: HeadingLevel.TITLE,
          alignment: 'center',
          spacing: { after: 400 }
        }));
      } else {
        children.push(new Paragraph({
          text: s.title,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        }));
        
        const textContent = s.content || '';
        const paragraphs = textContent.split('\n\n').filter(Boolean);
        
        paragraphs.forEach(pText => {
          children.push(new Paragraph({
            children: [new TextRun({ text: pText.replace(/\n/g, ' '), font: isIEEE ? 'Times New Roman' : undefined, size: isIEEE ? 20 : undefined })],
            spacing: { after: 200 },
            alignment: isIEEE ? 'both' : 'left'
          }));
        });
      }
    });

    const doc = new Document({
      sections: [{
        properties: isIEEE ? {
          column: { space: 708, count: 2 }, // 708 twips = 0.5 inch spacing
        } : {},
        children: children
      }]
    });

    try {
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${activePaper.title || 'paper'}.docx`);
    } catch (e) {
      console.error('Failed to generate docx', e);
    }
  }

  const wordCount = sections.reduce((acc, s) => acc + (s.content?.split(/\s+/).filter(Boolean).length || 0), 0);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner spinner-lg" /></div>;

  return (
    <div>
      {/* Pending Idea Format Modal */}
      {pendingIdea && !autoGenerating && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 500, padding: 24, position: 'relative' }}>
            <button className="btn btn-icon btn-ghost btn-sm" style={{ position: 'absolute', top: 16, right: 16 }} onClick={clearPendingIdea}><X size={16} /></button>
            <h3 style={{ marginBottom: 8 }}>Generate Paper from Idea</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              <strong>Idea:</strong> {pendingIdea.title || 'Untitled'}
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 8 }}>Format Template Guidelines</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <button className={`btn btn-sm ${formatInputType === 'text' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFormatInputType('text')}>Text / Paste</button>
                <button className={`btn btn-sm ${formatInputType === 'file' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFormatInputType('file')}>.docx / .txt File</button>
              </div>
              
              {formatInputType === 'text' ? (
                <textarea 
                  className="input w-full" 
                  rows={5} 
                  placeholder="e.g., IEEE format, strict double-column, include specific sections, use formal academic tone..."
                  value={formatText}
                  onChange={e => setFormatText(e.target.value)}
                />
              ) : (
                <div className="dropzone" style={{ padding: '24px 12px' }}>
                  <input type="file" accept=".docx,.txt,.md" style={{ display: 'none' }} id="format-upload" onChange={handleFormatUpload} />
                  <label htmlFor="format-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <FileUp size={24} style={{ opacity: 0.5 }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {formatFile ? formatFile.name : 'Click to upload template file'}
                    </span>
                  </label>
                </div>
              )}
            </div>
            
            <button className="btn btn-primary w-full" onClick={startAutoGeneration} disabled={autoGenerating}>
              <Sparkles size={16} /> Start Generation
            </button>
          </div>
        </div>
      )}

      {/* Auto Generating Modal Overlay */}
      {autoGenerating && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <Loader size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
          <h3 style={{ color: 'white' }}>Generating Paper...</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Generating section: {SECTIONS.find(s => s.id === generatingSection)?.label || '...'}</p>
        </div>
      )}

      {/* Paper List & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {papers.map(p => (
            <button key={p.id} className={`btn btn-sm ${activePaper?.id === p.id ? 'btn-primary' : 'btn-secondary'}`} onClick={() => selectPaper(p)}>
              <FileText size={14} /> {p.title?.slice(0, 30) || 'Untitled'}
            </button>
          ))}
          <button className="btn btn-sm btn-ghost" onClick={createPaper}><Plus size={14} /> New Paper</button>
        </div>
        {activePaper && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{wordCount} words</span>
            <select className="input" value={citationStyle} onChange={e => setCitationStyle(e.target.value)} style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}>
              {CITATION_STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select className="input" value={exportFormat} onChange={e => setExportFormat(e.target.value)} style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}>
              <option value="standard">Standard Docx</option>
              <option value="ieee">IEEE 2-Column Format</option>
            </select>
            <button className="btn btn-sm btn-secondary" onClick={exportPaper}><Download size={14} /> Export</button>
            <button className="btn btn-sm btn-secondary" onClick={() => setShowWebSearch(true)}><Globe size={14} style={{ color: 'var(--blue)' }} /> Web Search</button>
            <button className="btn btn-sm btn-primary" onClick={savePaper} disabled={saving}>
              {saving ? <span className="spinner" /> : <><Save size={14} /> Save</>}
            </button>
            <button className="btn btn-sm btn-ghost" style={{ color: 'var(--red)' }} onClick={() => deletePaper(activePaper.id)}>
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {!activePaper ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h3>No papers yet</h3>
          <p>Create a new paper to start writing with AI assistance</p>
          <button className="btn btn-primary" onClick={createPaper}><Plus size={16} /> Create Paper</button>
        </div>
      ) : (
        <div className="editor-layout" style={{ height: 'calc(100vh - 260px)' }}>
          {/* Editor Main */}
          <div className="editor-main">
            {sections.map(section => (
              <div key={section.id} className={`section-block ${activeSection === section.id ? 'active' : ''}`} onClick={() => setActiveSection(section.id)}>
                <div className="section-title">
                  <span>{section.title}</span>
                  <div className="section-actions">
                    <button className="btn btn-sm btn-ghost" onClick={(e) => { e.stopPropagation(); generateSection(section); }} disabled={generatingSection === section.id}>
                      {generatingSection === section.id ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={12} />}
                      {generatingSection === section.id ? ' Generating...' : ' AI Generate'}
                    </button>
                  </div>
                </div>
                <div className="section-content">
                  {section.type === 'title' ? (
                    <input type="text" value={section.content} onChange={e => updateSection(section.id, e.target.value)} placeholder="Enter paper title..." style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700, fontFamily: 'inherit', outline: 'none' }} />
                  ) : (
                    <textarea value={section.content} onChange={e => updateSection(section.id, e.target.value)} placeholder={`Write your ${section.title.toLowerCase()} here...`} style={{ minHeight: section.content ? Math.max(80, section.content.split('\n').length * 28) : 80 }} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Co-Pilot Sidebar */}
          <div className="editor-sidebar">
            <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} style={{ color: 'var(--accent-light)' }} /> Paper Co-Pilot
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {activeSection ? `Editing: ${sections.find(s => s.id === activeSection)?.title}` : 'Click a section to edit'}
              </p>
            </div>

            <div style={{ padding: 16, flex: 1, overflowY: 'auto' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>Quick actions:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['Check & Remove Plagiarism', 'Remove AI (Humanize Tone)', 'Improve academic writing', 'Add citations from papers', 'Make it more concise', 'Fix grammar and style'].map(cmd => (
                  <button key={cmd} className={`btn btn-sm ${cmd.includes('Plagiarism') || cmd.includes('Humanize') ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', fontSize: '0.75rem' }} onClick={() => { setCopilotInput(cmd); }} disabled={!activeSection}>
                    {cmd}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCopilot} style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
              <textarea className="input w-full" value={copilotInput} onChange={e => setCopilotInput(e.target.value)} placeholder="Tell Co-Pilot what to do..." rows={3} style={{ fontSize: '0.82rem', marginBottom: 8 }} disabled={!activeSection} />
              <button type="submit" className="btn btn-primary btn-sm w-full" disabled={copilotLoading || !activeSection || !copilotInput.trim()}>
                {copilotLoading ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Working...</> : <><Sparkles size={14} /> Apply</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Web Search Overlay Panel */}
      {showWebSearch && (
        <div className="sara-window" style={{ display: 'flex', zIndex: 100 }}>
          <div className="sara-header">
            <h3 style={{ margin: 0, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Globe size={16} style={{ color: 'var(--blue)' }} /> Live Web Research
            </h3>
            <button className="sara-btn-icon" onClick={() => setShowWebSearch(false)}><X size={14} /></button>
          </div>
          <div style={{ padding: 12, borderBottom: '1px solid var(--border)' }}>
            <form onSubmit={handleWebSearch} style={{ display: 'flex', gap: 8 }}>
              <input type="text" className="sara-input" placeholder="Search Google..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus />
              <button type="submit" className="sara-submit-btn" disabled={searchLoading || !searchQuery.trim()}>
                {searchLoading ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={14} />}
              </button>
            </form>
          </div>
          <div className="sara-body">
            {searchLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--blue)' }} /></div>
            ) : searchResults.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 32 }}>Search the web to find citations and references without leaving the editor.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {searchResults.map((res, i) => (
                  <div key={i} className="card" style={{ padding: 12, background: 'rgba(255,255,255,0.03)' }}>
                    <a href={res.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none', display: 'block', marginBottom: 4 }}>{res.title}</a>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>{res.snippet}</p>
                    <button 
                      className="btn btn-ghost btn-sm" 
                      style={{ marginTop: 8, padding: '2px 6px', fontSize: '0.7rem' }}
                      onClick={() => setCopilotInput(`Synthesize this web result into my paper: ${res.snippet} (Source: ${res.title})`)}
                    >
                      <Sparkles size={10} /> Send to Co-pilot
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
