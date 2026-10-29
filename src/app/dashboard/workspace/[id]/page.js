'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, MessageSquare, Brain, PenTool, StickyNote, Database, Rocket, Beaker, MonitorPlay, ShieldCheck, Lightbulb, Menu, X, Palette, Bot } from 'lucide-react';
import Link from 'next/link';
import PapersTab from './PapersTab';
import ChatTab from './ChatTab';
import BrainstormTab from './BrainstormTab';
import EditorTab from './EditorTab';
import NotesTab from './NotesTab';
import DatasetsTab from './DatasetsTab';
import ProjectsTab from './ProjectsTab';
import ExperimentsTab from './ExperimentsTab';
import PresentationsTab from './PresentationsTab';
import IntegrityTab from './IntegrityTab';
import InnovationTab from './InnovationTab';
import CanvasTab from './CanvasTab';
import SwarmTab from './SwarmTab';
import SoundscapePlayer from '@/components/SoundscapePlayer';

export default function WorkspaceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [workspace, setWorkspace] = useState(null);
  const [activeTab, setActiveTab] = useState('papers');
  const [loading, setLoading] = useState(true);
  const [workspaceSidebarOpen, setWorkspaceSidebarOpen] = useState(false);
  const [pendingIdea, setPendingIdea] = useState(null);
  const supabase = createClient();

  const handleGeneratePaper = (idea) => {
    setPendingIdea(idea);
    setActiveTab('editor');
  };

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('workspaces').select('*').eq('id', id).single();
      if (!data) { router.push('/dashboard'); return; }
      setWorkspace(data);
      setLoading(false);
    }
    load();
  }, [id]);

  const tabs = [
    { key: 'swarm', label: 'AI Swarm Arena', icon: <Bot size={18} /> },
    { key: 'papers', label: 'Papers', icon: <FileText size={18} /> },
    { key: 'chat', label: 'Chat', icon: <MessageSquare size={18} /> },
    { key: 'notes', label: 'Notes', icon: <StickyNote size={18} /> },
    { key: 'canvas', label: 'Canvas', icon: <Palette size={18} /> },
    { key: 'brainstorm', label: 'Brainstorm', icon: <Brain size={18} /> },
    { key: 'editor', label: 'Editor', icon: <PenTool size={18} /> },
    { key: 'datasets', label: 'Datasets', icon: <Database size={18} /> },
    { key: 'projects', label: 'Projects', icon: <Rocket size={18} /> },
    { key: 'experiments', label: 'Experiments', icon: <Beaker size={18} /> },
    { key: 'presentations', label: 'Presentations', icon: <MonitorPlay size={18} /> },
    { key: 'integrity', label: 'Integrity', icon: <ShieldCheck size={18} /> },
    { key: 'innovation', label: 'Innovation', icon: <Lightbulb size={18} /> },
  ];

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><div className="spinner spinner-lg" /></div>;

  return (
    <div className="workspace-layout">
      {/* Mobile Workspace Sidebar Toggle */}
      <button 
        className="btn btn-icon btn-secondary workspace-mobile-toggle" 
        onClick={() => setWorkspaceSidebarOpen(!workspaceSidebarOpen)}
      >
        {workspaceSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Workspace Vertical Sidebar */}
      <div className={`workspace-sidebar ${workspaceSidebarOpen ? 'open' : ''}`}>
        <div className="workspace-sidebar-header">
          <Link href="/dashboard" className="btn btn-icon btn-ghost btn-sm" style={{ marginBottom: 12 }}>
            <ArrowLeft size={16} />
          </Link>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            {workspace?.icon} {workspace?.name}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {workspace?.description || 'Research workspace'}
          </p>
        </div>

        <div className="workspace-sidebar-nav">
          <div className="workspace-sidebar-section">Core</div>
          {tabs.slice(0, 6).map(t => (
            <button
              key={t.key}
              className={`workspace-sidebar-link ${activeTab === t.key ? 'active' : ''}`}
              onClick={() => { setActiveTab(t.key); setWorkspaceSidebarOpen(false); }}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}

          <div className="workspace-sidebar-section" style={{ marginTop: 20 }}>Advanced</div>
          {tabs.slice(6).map(t => (
            <button
              key={t.key}
              className={`workspace-sidebar-link ${activeTab === t.key ? 'active' : ''}`}
              onClick={() => { setActiveTab(t.key); setWorkspaceSidebarOpen(false); }}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overlay for mobile */}
      {workspaceSidebarOpen && (
        <div className="workspace-overlay" onClick={() => setWorkspaceSidebarOpen(false)} />
      )}

      {/* Main Workspace Content */}
      <div className="workspace-content">
        <div className="workspace-content-header">
          <h2>{tabs.find(t => t.key === activeTab)?.icon} {tabs.find(t => t.key === activeTab)?.label}</h2>
        </div>
        
        <div className="workspace-content-body">
          {activeTab === 'swarm' && <SwarmTab workspaceId={id} onExportToEditor={(content) => { setPendingIdea(content); setActiveTab('editor'); }} />}
          {activeTab === 'papers' && <PapersTab workspaceId={id} />}
          {activeTab === 'chat' && <ChatTab workspaceId={id} />}
          {activeTab === 'notes' && <NotesTab workspaceId={id} />}
          {activeTab === 'canvas' && <CanvasTab workspaceId={id} />}
          {activeTab === 'brainstorm' && <BrainstormTab workspaceId={id} onGeneratePaper={handleGeneratePaper} />}
          {activeTab === 'editor' && <EditorTab workspaceId={id} pendingIdea={pendingIdea} clearPendingIdea={() => setPendingIdea(null)} />}
          {activeTab === 'datasets' && <DatasetsTab workspaceId={id} />}
          {activeTab === 'projects' && <ProjectsTab workspaceId={id} />}
          {activeTab === 'experiments' && <ExperimentsTab workspaceId={id} />}
          {activeTab === 'presentations' && <PresentationsTab workspaceId={id} />}
          {activeTab === 'integrity' && <IntegrityTab workspaceId={id} />}
          {activeTab === 'innovation' && <InnovationTab workspaceId={id} />}
        </div>
      </div>

      {/* Floating Deep Work Soundscape & Spotify Focus Player */}
      <SoundscapePlayer />
    </div>
  );
}
