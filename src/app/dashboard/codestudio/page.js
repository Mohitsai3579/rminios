'use client';

import { useState } from 'react';
import { 
  Code2, Sparkles, Play, Terminal, Download, Copy, Check, 
  Folder, FileCode, CheckCircle2, RefreshCw, Eye, Layers, 
  Box, ExternalLink, ArrowRight, ShieldCheck, Cpu 
} from 'lucide-react';
import { useDynamicIsland } from '@/context/DynamicIslandContext';

const PRESET_CODING_PROJECTS = [
  {
    title: '🧬 Whole-Slide Cancer Segmentation Service',
    stack: 'FastAPI + PyTorch UNet',
    architecture: 'Microservices & GPU Worker',
    prompt: 'Build a production FastAPI service that ingests high-resolution histopathology WSI patches, runs a PyTorch UNet segmentation backbone, and returns GeoJSON lesion masks with confidence intervals.'
  },
  {
    title: '🛡️ Real-Time Graph Fraud Detection API',
    stack: 'FastAPI + PyTorch Geometric + React',
    architecture: 'Event-Driven Streaming',
    prompt: 'Create a real-time transaction monitoring engine using Temporal Graph Convolutional Networks that evaluates Ethereum transfer graphs for money laundering syndicates.'
  },
  {
    title: '🛰️ Edge Hyperspectral Satellite Compression',
    stack: 'Python + C Extension + PyTorch',
    architecture: 'Edge Embedded Pipeline',
    prompt: 'Implement an ultra-low latency hyperspectral imagery compression pipeline with discrete wavelet transform and autoencoding under strict 5W thermal budgets.'
  },
  {
    title: '🎨 3D Interactive Molecular Docking Viewer',
    stack: 'React + Three.js (@react-three/fiber)',
    architecture: 'Client-Side WebGL',
    prompt: 'Build a 3D WebGL protein-ligand binding visualizer that parses PDB format and renders electrostatic surface potentials with interactive camera rotation.'
  }
];

export default function CodeStudioPage() {
  const { showNotification } = useDynamicIsland();
  const [projectPrompt, setProjectPrompt] = useState('');
  const [techStack, setTechStack] = useState('FastAPI + PyTorch');
  const [architectureStyle, setArchitectureStyle] = useState('Modular Monolith');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProject, setGeneratedProject] = useState(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [previewTab, setPreviewTab] = useState('sandbox'); // 'sandbox' | 'terminal'
  const [copiedCode, setCopiedCode] = useState(false);

  const handleRunAgent = async (customPrompt, customStack) => {
    const p = customPrompt || projectPrompt;
    const s = customStack || techStack;
    if (!p.trim()) return;

    setIsGenerating(true);
    setGeneratedProject(null);

    try {
      const res = await fetch('/api/agent/codestudio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectPrompt: p,
          techStack: s,
          architectureStyle
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate project');

      setGeneratedProject(data.agentResult);
      setSelectedFileIndex(0);
      showNotification({
        title: 'Coding Agent Project Ready',
        message: `${data.agentResult?.projectName || 'Project Architecture'} synthesized`,
        icon: <Code2 size={16} />,
        type: 'purple'
      });
    } catch (err) {
      alert(`Antigravity Agent Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCurrentFile = () => {
    if (!generatedProject?.files?.[selectedFileIndex]) return;
    navigator.clipboard.writeText(generatedProject.files[selectedFileIndex].content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadAll = () => {
    if (!generatedProject?.files) return;
    const currentFile = generatedProject.files[selectedFileIndex];
    const blob = new Blob([currentFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedFile = generatedProject?.files?.[selectedFileIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* Top Banner */}
      <div 
        style={{ 
          background: 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.18), transparent 70%), var(--bg-secondary)', 
          border: '1px solid rgba(99, 102, 241, 0.3)', 
          borderRadius: 16, 
          padding: 24,
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ background: 'linear-gradient(135deg, #6366f1, #2dd4bf)', padding: '5px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Code2 size={13} /> ANTIGRAVITY CODING AGENT
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Autonomous Full-Stack Architecture & Multi-File Code Synthesis
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Antigravity AI Code & Project Builder
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 6, maxWidth: 820 }}>
              Transform complex scientific and machine learning requirements into complete, multi-file codebases with production APIs, PyTorch models, test suites, and live sandbox prototypes.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>Multi-File Generation</span>
            <span style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(45, 212, 191, 0.15)', border: '1px solid rgba(45, 212, 191, 0.3)', fontSize: '0.75rem', color: '#2dd4bf', fontWeight: 600 }}>Live Sandbox Preview</span>
          </div>
        </div>

        {/* Real-World Challenge Presets */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>
            ONE-CLICK ARCHITECTURE PRESETS FOR DEMO:
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PRESET_CODING_PROJECTS.map((p, idx) => (
              <button
                key={idx}
                disabled={isGenerating}
                onClick={() => {
                  setProjectPrompt(p.prompt);
                  setTechStack(p.stack);
                  setArchitectureStyle(p.architecture);
                  handleRunAgent(p.prompt, p.stack);
                }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '6px 12px', background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Formulation Card */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 3, minWidth: 280 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
              Project Requirements & Specification
            </label>
            <textarea
              className="input"
              rows={3}
              placeholder="e.g. Build an end-to-end FastAPI + PyTorch microservice for histopathology cancer segmentation..."
              value={projectPrompt}
              onChange={e => setProjectPrompt(e.target.value)}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                Tech Stack
              </label>
              <select className="input" value={techStack} onChange={e => setTechStack(e.target.value)} style={{ width: '100%' }}>
                <option value="FastAPI + PyTorch">FastAPI + PyTorch (ML Microservice)</option>
                <option value="Next.js 15 + Tailwind CSS">Next.js 15 + Tailwind (Full-Stack)</option>
                <option value="React + Three.js 3D">React + Three.js (3D Visualization)</option>
                <option value="Python + Scikit-Learn + Pandas">Python + Scikit-Learn (Data Pipeline)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                Architecture Pattern
              </label>
              <select className="input" value={architectureStyle} onChange={e => setArchitectureStyle(e.target.value)} style={{ width: '100%' }}>
                <option value="Modular Monolith">Modular Monolith</option>
                <option value="Microservices">Microservices & Workers</option>
                <option value="Edge Serverless">Edge Serverless</option>
              </select>
            </div>

            <button
              onClick={() => handleRunAgent()}
              disabled={isGenerating || !projectPrompt.trim()}
              className="btn btn-primary"
              style={{ marginTop: 4, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 700 }}
            >
              {isGenerating ? (
                <><RefreshCw size={15} className="spinner" /> Synthesizing Project...</>
              ) : (
                <><Play size={15} /> Build Project with Agent</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* THREE-PANEL IDE WORKBENCH */}
      {generatedProject && (
        <div style={{ background: '#090c12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          
          {/* Top IDE Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: '#111520', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{generatedProject.projectName}</span>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 10, background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-light)' }}>
                {generatedProject.files?.length} files generated
              </span>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleCopyCurrentFile} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem' }}>
                {copiedCode ? <><Check size={14} style={{ color: 'var(--green)' }} /> Copied</> : <><Copy size={14} /> Copy File</>}
              </button>
              <button onClick={handleDownloadAll} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem' }}>
                <Download size={14} /> Export File
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 1fr', minHeight: 520 }}>
            
            {/* Panel 1: File Tree */}
            <div style={{ background: '#0e111a', borderRight: '1px solid rgba(255,255,255,0.06)', padding: 12 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 6, letterSpacing: 0.5 }}>
                Explorer
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {generatedProject.files?.map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedFileIndex(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: 'none',
                      background: selectedFileIndex === idx ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                      color: selectedFileIndex === idx ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <FileCode size={14} style={{ color: selectedFileIndex === idx ? 'var(--accent)' : 'var(--text-muted)', flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.path || file.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Panel 2: Code Editor View */}
            <div style={{ background: '#090c12', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>{selectedFile?.path || selectedFile?.name}</span>
                <span style={{ textTransform: 'uppercase' }}>{selectedFile?.language || 'code'}</span>
              </div>
              <div style={{ flex: 1, padding: 16, overflowY: 'auto', maxHeight: 520 }}>
                <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.78rem', lineHeight: 1.6, color: '#e2e8f0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {selectedFile?.content}
                </pre>
              </div>
            </div>

            {/* Panel 3: Live Sandbox Preview / Terminal Logs */}
            <div style={{ background: '#0e111a', display: 'flex', flexDirection: 'column' }}>
              
              {/* Tabs for Right Panel */}
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#111520' }}>
                <button
                  onClick={() => setPreviewTab('sandbox')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 0',
                    background: previewTab === 'sandbox' ? '#0e111a' : 'transparent',
                    color: previewTab === 'sandbox' ? 'var(--teal)' : 'var(--text-muted)',
                    border: 'none',
                    borderBottom: previewTab === 'sandbox' ? '2px solid var(--teal)' : 'none',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Eye size={14} /> Live Sandbox Preview
                </button>
                <button
                  onClick={() => setPreviewTab('terminal')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 0',
                    background: previewTab === 'terminal' ? '#0e111a' : 'transparent',
                    color: previewTab === 'terminal' ? 'var(--accent)' : 'var(--text-muted)',
                    border: 'none',
                    borderBottom: previewTab === 'terminal' ? '2px solid var(--accent)' : 'none',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Terminal size={14} /> Runtime Terminal Logs
                </button>
              </div>

              {/* View A: Sandbox iFrame */}
              {previewTab === 'sandbox' && (
                <div style={{ flex: 1, height: '100%', minHeight: 460 }}>
                  <iframe
                    srcDoc={generatedProject.sandboxHtml}
                    title="Live Sandbox"
                    style={{ width: '100%', height: '100%', minHeight: 460, border: 'none' }}
                    sandbox="allow-scripts"
                  />
                </div>
              )}

              {/* View B: Terminal Execution Logs */}
              {previewTab === 'terminal' && (
                <div style={{ flex: 1, padding: 18, background: '#05070a', overflowY: 'auto', maxHeight: 520, fontFamily: 'monospace', fontSize: '0.76rem', color: '#10b981', lineHeight: 1.7 }}>
                  {generatedProject.terminalLogs?.map((log, i) => (
                    <div key={i} style={{ marginBottom: 4 }}>
                      {log.startsWith('$') ? <span style={{ color: '#fff', fontWeight: 700 }}>{log}</span> : log}
                    </div>
                  ))}
                  <div style={{ color: '#6366f1', marginTop: 12 }}>
                    ● Worker process active on port 3000 (Hot Reloading Ready)
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
