'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Globe2, Sparkles, Search, Compass, Share2, Layers, ZoomIn, 
  ZoomOut, RotateCcw, ExternalLink, Lightbulb, ArrowRight, BookOpen,
  Filter, Crosshair, Award
} from 'lucide-react';
import { useDynamicIsland } from '@/context/DynamicIslandContext';

const INITIAL_NODES = [
  // AI & ML Cluster
  { id: '1', title: 'Attention Is All You Need', domain: 'ai', category: 'Deep Learning', year: 2017, citations: 124000, x: 0, y: 0, z: 0, radius: 14, color: '#6366f1', connections: ['2', '3', '4', '7'] },
  { id: '2', title: 'BERT: Pre-training Deep Bidirectional Transformers', domain: 'ai', category: 'NLP', year: 2018, citations: 89000, x: 120, y: 40, z: -30, radius: 11, color: '#818cf8', connections: ['1', '5'] },
  { id: '3', title: 'Language Models are Few-Shot Learners (GPT-3)', domain: 'ai', category: 'LLMs', year: 2020, citations: 45000, x: 70, y: -90, z: 60, radius: 12, color: '#a855f7', connections: ['1', '5', '8'] },
  { id: '4', title: 'Deep Residual Learning for Image Recognition (ResNet)', domain: 'ai', category: 'Computer Vision', year: 2016, citations: 180000, x: -130, y: 60, z: -40, radius: 13, color: '#38bdf8', connections: ['1', '6'] },
  { id: '5', title: 'Retrieval-Augmented Generation (RAG)', domain: 'ai', category: 'Knowledge Grounding', year: 2020, citations: 18500, x: 160, y: -60, z: 80, radius: 9, color: '#c084fc', connections: ['2', '3'] },
  { id: '6', title: 'Denoising Diffusion Probabilistic Models (DDPM)', domain: 'ai', category: 'Generative Vision', year: 2020, citations: 22000, x: -160, y: -50, z: -80, radius: 9, color: '#06b6d4', connections: ['4'] },

  // Bio & Health Cluster
  { id: '7', title: 'Highly accurate protein structure prediction (AlphaFold)', domain: 'bio', category: 'Structural Biology', year: 2021, citations: 29000, x: 40, y: 160, z: 110, radius: 13, color: '#10b981', connections: ['1', '9'] },
  { id: '8', title: 'Foundation Models in Healthcare (Med-PaLM)', domain: 'bio', category: 'Medical AI', year: 2023, citations: 8200, x: 130, y: 140, z: 150, radius: 8, color: '#34d399', connections: ['3', '7'] },
  { id: '9', title: 'CRISPR-Cas9 Multiplex Genome Editing', domain: 'bio', category: 'Genetics', year: 2012, citations: 55000, x: -80, y: 190, z: 90, radius: 12, color: '#059669', connections: ['7', '10'] },

  // Climate & Materials Cluster
  { id: '10', title: 'Catalytic Depolymerization of Microplastics', domain: 'climate', category: 'Environmental Chemistry', year: 2023, citations: 4300, x: -180, y: 150, z: 20, radius: 9, color: '#f59e0b', connections: ['9', '11'] },
  { id: '11', title: 'Carbon-Negative Direct Air Capture Nanomaterials', domain: 'climate', category: 'Materials Science', year: 2022, citations: 6100, x: -210, y: 40, z: 120, radius: 8, color: '#fbbf24', connections: ['10', '12'] },

  // Quantum & Physics Cluster
  { id: '12', title: 'Fault-Tolerant Quantum Error Correction with Surface Codes', domain: 'quantum', category: 'Quantum Info', year: 2021, citations: 7400, x: 90, y: -180, z: -120, radius: 9, color: '#f43f5e', connections: ['13', '11'] },
  { id: '13', title: 'Quantum Computational Advantage with 53 Qubits', domain: 'quantum', category: 'Quantum Hardware', year: 2019, citations: 16000, x: -30, y: -200, z: -150, radius: 11, color: '#fb7185', connections: ['12', '1'] }
];

export default function GalaxyPage() {
  const { showNotification } = useDynamicIsland();
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [selectedNode, setSelectedNode] = useState(INITIAL_NODES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const [customIdea, setCustomIdea] = useState('');
  const [synthesizing, setSynthesizing] = useState(false);
  const [bridgeOpportunity, setBridgeOpportunity] = useState(null);

  const canvasRef = useRef(null);
  const rotRef = useRef({ x: 0.2, y: 0.3 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1.1);

  // Filter nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      const matchDomain = domainFilter === 'all' || n.domain === domainFilter;
      const matchSearch = !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDomain && matchSearch;
    });
  }, [nodes, domainFilter, searchQuery]);

  // 3D Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const rot = rotRef.current;
      const zoom = zoomRef.current;

      // Slowly auto-rotate if not interacting
      if (!isDraggingRef.current) {
        rot.y += 0.0018;
      }

      const cosY = Math.cos(rot.y);
      const sinY = Math.sin(rot.y);
      const cosX = Math.cos(rot.x);
      const sinX = Math.sin(rot.x);

      // Project 3D to 2D
      const projected = filteredNodes.map(node => {
        // Rotate Y
        let x1 = node.x * cosY - node.z * sinY;
        let z1 = node.z * cosY + node.x * sinY;
        // Rotate X
        let y1 = node.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + node.y * sinX;

        const distance = 420;
        const scale = (distance / (distance + z2 * 0.7)) * zoom;
        const px = cx + x1 * scale;
        const py = cy + y1 * scale;

        return { ...node, px, py, scale, z2 };
      });

      // Sort by depth (painters algorithm)
      projected.sort((a, b) => b.z2 - a.z2);

      // Draw connection lines
      ctx.lineWidth = 1;
      projected.forEach(n1 => {
        if (!n1.connections) return;
        n1.connections.forEach(targetId => {
          const n2 = projected.find(p => p.id === targetId);
          if (n2 && n1.z2 > -300 && n2.z2 > -300) {
            const isHighlighted = selectedNode && (selectedNode.id === n1.id || selectedNode.id === n2.id);
            ctx.beginPath();
            ctx.moveTo(n1.px, n1.py);
            ctx.lineTo(n2.px, n2.py);
            ctx.strokeStyle = isHighlighted ? 'rgba(99, 102, 241, 0.7)' : 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = isHighlighted ? 2.5 : 1;
            ctx.stroke();
          }
        });
      });

      // Draw nodes
      projected.forEach(node => {
        const isSelected = selectedNode && selectedNode.id === node.id;
        const radius = Math.max(4, node.radius * node.scale * 0.9);

        // Outer glow
        const grad = ctx.createRadialGradient(node.px, node.py, radius * 0.2, node.px, node.py, radius * 2.5);
        grad.addColorStop(0, node.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(node.px, node.py, radius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Node core
        ctx.beginPath();
        ctx.arc(node.px, node.py, radius, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#ffffff' : node.color;
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#38bdf8' : 'rgba(255,255,255,0.4)';
        ctx.lineWidth = isSelected ? 3 : 1;
        ctx.stroke();

        // Node label
        if (node.scale > 0.8 || isSelected) {
          ctx.font = `${Math.max(10, Math.floor(11 * node.scale))}px Inter, sans-serif`;
          ctx.fillStyle = isSelected ? '#fff' : 'rgba(255,255,255,0.75)';
          ctx.textAlign = 'center';
          ctx.fillText(node.title.slice(0, 22) + (node.title.length > 22 ? '...' : ''), node.px, node.py + radius + 14);
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [filteredNodes, selectedNode]);

  // Mouse drag interaction
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    rotRef.current.y += dx * 0.005;
    rotRef.current.x = Math.max(-1.4, Math.min(1.4, rotRef.current.x + dy * 0.005));
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleClickCanvas = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check hit test on 2D projected points
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const rot = rotRef.current;
    const zoom = zoomRef.current;
    const cosY = Math.cos(rot.y);
    const sinY = Math.sin(rot.y);
    const cosX = Math.cos(rot.x);
    const sinX = Math.sin(rot.x);

    let clicked = null;
    filteredNodes.forEach(node => {
      let x1 = node.x * cosY - node.z * sinY;
      let z1 = node.z * cosY + node.x * sinY;
      let y1 = node.y * cosX - z1 * sinX;
      let z2 = z1 * cosX + node.y * sinX;

      const scale = (420 / (420 + z2 * 0.7)) * zoom;
      const px = cx + x1 * scale;
      const py = cy + y1 * scale;
      const r = Math.max(8, node.radius * scale * 1.5);

      const dist = Math.hypot(clickX - px, clickY - py);
      if (dist <= r) {
        clicked = node;
      }
    });

    if (clicked) {
      setSelectedNode(clicked);
      generateBridgeHypothesis(clicked);
    }
  };

  // Generate interdisciplinary bridge hypothesis
  const generateBridgeHypothesis = (node) => {
    const bridges = [
      `What if we bridge ${node.title} with Catalytic Microplastic Depolymerization? Potential: Neural-guided enzyme evolution to decompose ocean polymers 100x faster.`,
      `Quantum entanglement coupling with ${node.title}: Explores whether sub-nanosecond error correction can optimize training convergence on non-convex manifolds.`,
      `Cross-domain foundation model: Transferring weights from ${node.title} to real-time bio-sensor telemetry for early sepsis detection.`
    ];
    setBridgeOpportunity(bridges[Math.floor(Math.random() * bridges.length)]);
  };

  // Synthesize new node into 3D galaxy
  const handleSynthesizeNode = async (e) => {
    e.preventDefault();
    if (!customIdea.trim()) return;
    setSynthesizing(true);

    try {
      const res = await fetch('/api/brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: customIdea,
          instructions: 'Generate a seminal landmark scientific paper title and coordinates'
        })
      });

      const angle = Math.random() * Math.PI * 2;
      const distance = 140 + Math.random() * 80;
      const newNode = {
        id: `node-${Date.now()}`,
        title: customIdea,
        domain: 'ai',
        category: 'Emerging Breakthrough',
        year: 2026,
        citations: 1,
        x: Math.cos(angle) * distance,
        y: (Math.random() - 0.5) * 160,
        z: Math.sin(angle) * distance,
        radius: 12,
        color: '#22c55e',
        connections: [selectedNode ? selectedNode.id : '1']
      };

      setNodes(prev => [...prev, newNode]);
      setSelectedNode(newNode);
      setCustomIdea('');
      generateBridgeHypothesis(newNode);
      showNotification({
        title: 'Constellation Coordinate Mapped',
        message: `Synthesized "${newNode.title.slice(0, 32)}" into 3D Galaxy`,
        icon: <Sparkles size={16} />,
        type: 'purple'
      });
    } catch (err) {
      console.error(err);
    }
    setSynthesizing(false);
  };

  return (
    <>
      <div className="topbar">
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Globe2 size={22} style={{ color: 'var(--accent)' }} />
            3D Citation Constellation & Knowledge Galaxy
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            Interactive 3D celestial mapping of global scientific literature, citation gravity wells, and white space opportunities.
          </p>
        </div>
      </div>

      <div className="page-content" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, height: 'calc(100vh - 120px)', minHeight: 650 }}>
        {/* 3D Canvas Viewport */}
        <div 
          className="card" 
          style={{ 
            position: 'relative', 
            padding: 0, 
            overflow: 'hidden', 
            background: 'radial-gradient(circle at 50% 50%, #0d0f18 0%, #050608 100%)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {/* Top Canvas Controls Bar */}
          <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', zIndex: 10, pointerEvents: 'none' }}>
            <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search papers & concepts..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="input"
                  style={{ paddingLeft: 30, height: 34, fontSize: '0.78rem', width: 220, background: 'rgba(15,17,26,0.85)', backdropFilter: 'blur(16px)' }}
                />
              </div>

              <select
                value={domainFilter}
                onChange={e => setDomainFilter(e.target.value)}
                className="input"
                style={{ height: 34, fontSize: '0.78rem', background: 'rgba(15,17,26,0.85)', backdropFilter: 'blur(16px)', width: 140 }}
              >
                <option value="all">All Domains (13)</option>
                <option value="ai">AI & Machine Learning</option>
                <option value="bio">Biology & Health</option>
                <option value="climate">Climate & Materials</option>
                <option value="quantum">Quantum Computing</option>
              </select>
            </div>

            {/* Zoom / Reset Buttons */}
            <div style={{ display: 'flex', gap: 6, pointerEvents: 'auto' }}>
              <button 
                onClick={() => { zoomRef.current = Math.min(2.2, zoomRef.current + 0.2); }} 
                className="btn btn-secondary btn-sm"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button 
                onClick={() => { zoomRef.current = Math.max(0.6, zoomRef.current - 0.2); }} 
                className="btn btn-secondary btn-sm"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <button 
                onClick={() => { rotRef.current = { x: 0.2, y: 0.3 }; zoomRef.current = 1.1; }} 
                className="btn btn-ghost btn-sm"
                title="Reset Camera View"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Interactive WebGL/Canvas Viewport */}
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={handleClickCanvas}
            style={{ width: '100%', height: '100%', cursor: 'grab', display: 'block' }}
          />

          {/* Legend Bottom Left */}
          <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', gap: 14, background: 'rgba(10,11,15,0.75)', padding: '6px 14px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', fontSize: '0.7rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }} /> AI / ML</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} /> Bio / Genomics</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} /> Climate & Materials</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e' }} /> Quantum Physics</span>
          </div>
        </div>

        {/* Node Inspection & White Space Studio Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
          {selectedNode ? (
            <div className="card" style={{ padding: 20, border: '1px solid rgba(99, 102, 241, 0.3)', background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(26,27,38,0.8))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>
                  {selectedNode.category} • {selectedNode.year}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 700 }}>
                  {selectedNode.citations.toLocaleString()} Citations
                </span>
              </div>

              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.05rem', color: '#fff', lineHeight: 1.3 }}>
                {selectedNode.title}
              </h3>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                Gravity Core Coordinates: ({Math.round(selectedNode.x)}, {Math.round(selectedNode.y)}, {Math.round(selectedNode.z)})
              </div>

              {/* Connected Citations */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12, marginBottom: 14 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Share2 size={13} /> Gravitational Citation Links ({selectedNode.connections?.length || 0})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedNode.connections?.map(cId => {
                    const target = nodes.find(n => n.id === cId);
                    if (!target) return null;
                    return (
                      <button
                        key={cId}
                        onClick={() => { setSelectedNode(target); generateBridgeHypothesis(target); }}
                        style={{
                          textAlign: 'left',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: 8,
                          padding: '6px 10px',
                          color: '#fff',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '85%' }}>
                          {target.title}
                        </span>
                        <ArrowRight size={12} style={{ color: 'var(--accent)' }} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Unexplored White Space Bridge */}
              {bridgeOpportunity && (
                <div style={{ background: 'rgba(45, 212, 191, 0.08)', border: '1px solid rgba(45, 212, 191, 0.3)', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Lightbulb size={14} /> Unexplored White Space Hypothesis
                  </div>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    {bridgeOpportunity}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
              Click any node in the 3D Galaxy to inspect its citation dependencies and breakthrough lineage.
            </div>
          )}

          {/* Synthesize New Knowledge Node Form */}
          <div className="card" style={{ padding: 18 }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} style={{ color: 'var(--amber)' }} />
              Plot New Research Hypothesis in 3D
            </h4>
            <form onSubmit={handleSynthesizeNode}>
              <textarea
                className="input"
                rows={3}
                placeholder="Enter novel thesis or model concept to calculate gravitational orbit..."
                value={customIdea}
                onChange={e => setCustomIdea(e.target.value)}
                style={{ fontSize: '0.78rem', marginBottom: 10 }}
              />
              <button
                type="submit"
                disabled={synthesizing || !customIdea.trim()}
                className="btn btn-primary btn-sm w-full"
                style={{ justifyContent: 'center' }}
              >
                {synthesizing ? 'Calculating Celestial Orbit...' : 'Plot into Galaxy'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
