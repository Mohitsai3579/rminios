'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, FileText, UploadCloud, Target, BookOpen, Code, Beaker, 
  ArrowRight, ShieldCheck, Rocket, Zap, BarChart, Database, Lock, 
  Terminal, Activity, CheckCircle2, Star, Sparkles, Compass, 
  Headphones, Play, Pause, ChevronDown, ChevronRight, Check, X,
  Radio, Cpu, Layers, Disc3, ExternalLink, RefreshCw, MessageSquare
} from 'lucide-react';
import './landing.css';

// Lazy load 3D background canvas
const HeroScene = dynamic(() => import('@/components/HeroScene'), { 
  ssr: false,
  loading: () => (
    <div className="canvas-container-3d flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
});

const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function LandingPage() {
  // Dynamic Site Settings from Supabase
  const [siteSettings, setSiteSettings] = useState({
    owner_name: 'Mohit Jonnadula',
    support_email: 'mohitjonnadula16@gmail.com',
    support_phone: '9494366318'
  });

  // Interactive Engine Playground State
  const [activeEngineTab, setActiveEngineTab] = useState('galaxy'); // 'galaxy' | 'python' | 'swarm' | 'podcast' | 'peer-review' | 'venture'
  const [selectedGalaxyNode, setSelectedGalaxyNode] = useState('transformers');
  const [isRunningPython, setIsRunningPython] = useState(false);
  const [pythonOutput, setPythonOutput] = useState([
    ">> Pyodide 0.26 WebAssembly Runtime Initialized [Emscripten 3.1.58]",
    ">> Ready to execute torch.nn.MultiheadAttention benchmark."
  ]);
  const [isPlayingAudioSim, setIsPlayingAudioSim] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setSiteSettings(data);
      })
      .catch(() => {});
  }, []);

  // Global mouse tracking for bento glow effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      for (const card of document.querySelectorAll(".bento-item, .glass-panel")) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleRunPython = () => {
    if (isRunningPython) return;
    setIsRunningPython(true);
    setPythonOutput(prev => [...prev, ">> Compiling PyTorch tensor graphs in browser..."]);
    
    setTimeout(() => {
      setPythonOutput(prev => [
        ...prev,
        ">> Synthesized FlashAttention-3 Kernel [B=1, H=8, Seq=4096, D=64]",
        ">> FlashAttention Speedup: 3.42x vs Standard O(N²)",
        ">> Peak Memory Allocation: 14.2 MB (88.4% VRAM Reduction)",
        ">> Empirical Validation Score: 99.82% Exact Match [PASS]"
      ]);
      setIsRunningPython(false);
    }, 1200);
  };

  return (
    <div className="landing-container">
      {/* 3D Celestial Background */}
      <HeroScene />

      {/* Floating Frosted Navigation */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(99,102,241,0.5)' }}>
            <Brain size={20} style={{ color: '#fff' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>RMinios</span>
            <span style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: 8, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.35)', color: '#a5b4fc', fontWeight: 700 }}>OS 2.5</span>
          </div>
        </div>

        <div className="landing-nav-links">
          <a href="#engines" className="landing-nav-link">Engines</a>
          <a href="#fleet" className="landing-nav-link">Model Fleet</a>
          <a href="#innovations" className="landing-nav-link">Innovations</a>
          <a href="#architecture" className="landing-nav-link">Architecture</a>
          <a href="#pricing" className="landing-nav-link">Pricing</a>
          <a href="#faq" className="landing-nav-link">FAQ</a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="status-pill-live hidden-mobile">
            <span className="status-dot-pulse" />
            <span>52 Engines Live</span>
          </div>
          <Link href="/login" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}>
            Sign In
          </Link>
          <Link href="/signup" className="premium-btn-primary" style={{ padding: '9px 20px', fontSize: '0.85rem' }}>
            Launch Hub <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      {/* =====================================================================
          HERO SECTION
          ===================================================================== */}
      <section className="hero-section">
        <div className="hero-bg-glow" />
        
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.12 } },
          }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, width: '100%' }}
        >
          {/* Top Badge */}
          <motion.div variants={FADE_UP_VARIANTS} className="hero-badge-pill">
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
            <span>Introducing RMinios OS 2.5 • Frontier Multi-Agent Research System</span>
          </motion.div>

          {/* Hero Title */}
          <motion.h1 variants={FADE_UP_VARIANTS} className="hero-title">
            The Autonomous Frontier for <br />
            <span className="text-gradient-hero">Scientific Discovery</span> & <span className="text-gradient-purple">AI Engineering.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={FADE_UP_VARIANTS} className="hero-subtitle">
            Orchestrate 4-agent LLM debate swarms, in-browser PyTorch experiment sandboxes, 3D citation constellations, and academic-to-venture synthesis at the speed of thought.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={FADE_UP_VARIANTS} className="hero-cta-group">
            <Link href="/signup" className="premium-btn-primary" style={{ padding: '14px 30px', fontSize: '0.98rem' }}>
              Launch Research Hub (Free) <ArrowRight size={18} />
            </Link>
            <a href="#engines" className="premium-btn" style={{ padding: '14px 26px', fontSize: '0.94rem' }}>
              <Zap size={17} style={{ color: '#eab308' }} /> Explore 6 Live Engines
            </a>
          </motion.div>

          {/* Live Micro-Stats Bar */}
          <motion.div variants={FADE_UP_VARIANTS} className="hero-stats-bar">
            <div className="hero-stat-item">
              <span className="hero-stat-value">42M+</span>
              <span className="hero-stat-label">Papers Indexed</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <span className="hero-stat-value">4 Frontier LLMs</span>
              <span className="hero-stat-label">Swarm Consensus</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <span className="hero-stat-value">0ms Latency</span>
              <span className="hero-stat-label">In-Browser Pyodide WASM</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <span className="hero-stat-value">NeurIPS / ICML</span>
              <span className="hero-stat-label">Adversarial Peer Review</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <span className="hero-stat-value">$500M+</span>
              <span className="hero-stat-label">Active Grant Radar</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* =====================================================================
          ⭐ HERO SHOWCASE: INTERACTIVE ENGINE PLAYGROUND
          ===================================================================== */}
      <section id="engines" className="section-premium" style={{ background: 'linear-gradient(180deg, #000000 0%, #080a12 50%, #000000 100%)' }}>
        <h2 className="section-title">Test the Breakthrough Engines.</h2>
        <p className="section-subtitle">
          Six autonomous AI engines engineered to replace fragmented research tools. Click any tab below to test the live interactive preview right now.
        </p>

        <div className="playground-container">
          {/* Engine Tabs Bar */}
          <div className="playground-nav-tabs">
            <button 
              className={`playground-tab-btn ${activeEngineTab === 'galaxy' ? 'active' : ''}`}
              onClick={() => setActiveEngineTab('galaxy')}
            >
              <Compass size={16} /> 3D Citation Galaxy
              <span className="playground-tab-badge">WebGL</span>
            </button>
            <button 
              className={`playground-tab-btn ${activeEngineTab === 'python' ? 'active' : ''}`}
              onClick={() => setActiveEngineTab('python')}
            >
              <Code size={16} /> In-Browser Python Sandbox
              <span className="playground-tab-badge">WASM</span>
            </button>
            <button 
              className={`playground-tab-btn ${activeEngineTab === 'swarm' ? 'active' : ''}`}
              onClick={() => setActiveEngineTab('swarm')}
            >
              <Cpu size={16} /> 4-Agent Swarm Arena
              <span className="playground-tab-badge">4 LLMs</span>
            </button>
            <button 
              className={`playground-tab-btn ${activeEngineTab === 'podcast' ? 'active' : ''}`}
              onClick={() => setActiveEngineTab('podcast')}
            >
              <Headphones size={16} /> Dual-Host Audio Studio
              <span className="playground-tab-badge">NotebookLM</span>
            </button>
            <button 
              className={`playground-tab-btn ${activeEngineTab === 'peer-review' ? 'active' : ''}`}
              onClick={() => setActiveEngineTab('peer-review')}
            >
              <ShieldCheck size={16} /> Adversarial Peer Review
              <span className="playground-tab-badge">NeurIPS</span>
            </button>
            <button 
              className={`playground-tab-btn ${activeEngineTab === 'venture' ? 'active' : ''}`}
              onClick={() => setActiveEngineTab('venture')}
            >
              <Rocket size={16} /> Academic Venture Studio
              <span className="playground-tab-badge">Startup AI</span>
            </button>
          </div>

          {/* Tab Viewport */}
          <div className="playground-viewport">
            <AnimatePresence mode="wait">
              {/* TAB 1: 3D GALAXY SIMULATION */}
              {activeEngineTab === 'galaxy' && (
                <motion.div 
                  key="galaxy"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="galaxy-sim-canvas"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 20 }}>
                    <div style={{ background: 'rgba(0,0,0,0.6)', padding: '8px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 600 }}>INTERACTION MODE:</span>
                      <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700 }}>Click any landmark paper to pinpoint undiscovered research white spaces</div>
                    </div>
                    <Link href="/dashboard/galaxy" className="premium-btn" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
                      Launch 3D WebGL Canvas <ExternalLink size={13} />
                    </Link>
                  </div>

                  {/* Interactive Galaxy Nodes */}
                  <div 
                    className={`galaxy-node ${selectedGalaxyNode === 'transformers' ? 'selected' : ''}`}
                    style={{ top: '35%', left: '15%' }}
                    onClick={() => setSelectedGalaxyNode('transformers')}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }} />
                    Attention Is All You Need (Vaswani et al.)
                  </div>

                  <div 
                    className={`galaxy-node ${selectedGalaxyNode === 'ddpm' ? 'selected' : ''}`}
                    style={{ top: '22%', right: '22%' }}
                    onClick={() => setSelectedGalaxyNode('ddpm')}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e' }} />
                    Denoising Diffusion Probabilistic Models (Ho et al.)
                  </div>

                  <div 
                    className={`galaxy-node ${selectedGalaxyNode === 'lora' ? 'selected' : ''}`}
                    style={{ bottom: '30%', left: '26%' }}
                    onClick={() => setSelectedGalaxyNode('lora')}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                    LoRA: Low-Rank Adaptation (Hu et al.)
                  </div>

                  <div 
                    className={`galaxy-node ${selectedGalaxyNode === 'mamba' ? 'selected' : ''}`}
                    style={{ bottom: '25%', right: '18%' }}
                    onClick={() => setSelectedGalaxyNode('mamba')}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#38bdf8' }} />
                    Mamba: Linear-Time Sequence Modeling (Gu et al.)
                  </div>

                  {/* Dynamic White Space Output Card */}
                  <div className="galaxy-whitespace-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }} />
                      <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#4ade80' }}>
                        UNEXPLORED RESEARCH GAP DETECTED
                      </span>
                    </div>
                    {selectedGalaxyNode === 'transformers' && (
                      <div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '0.92rem', color: '#fff', fontWeight: 700 }}>
                          Sub-Quadratic Cross-Attention for High-Throughput Spatial Genomics
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                          While Vaswani et al. solves token routing in O(N²), billion-scale genomic cell reads suffer extreme memory blowup. Vector proximity reveals an unbridged gap between LoRA rank decomposition and sparse FlashAttention.
                        </p>
                        <div style={{ marginTop: 10, display: 'flex', gap: 10, fontSize: '0.72rem', color: '#38bdf8' }}>
                          <span>Discovery Potential: 98.4%</span> • <span>Estimated Citations: 450+</span>
                        </div>
                      </div>
                    )}
                    {selectedGalaxyNode === 'ddpm' && (
                      <div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '0.92rem', color: '#fff', fontWeight: 700 }}>
                          Deterministic Hamiltonian Flow Matching for Crystal Lattice Synthesis
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                          DDPM Langevin sampling requires 1,000 steps. Bridging this node with Riemannian geometry yields continuous 1-step generative trajectory for inorganic superconductors.
                        </p>
                        <div style={{ marginTop: 10, display: 'flex', gap: 10, fontSize: '0.72rem', color: '#f43f5e' }}>
                          <span>Discovery Potential: 96.8%</span> • <span>Target Venue: Nature Materials</span>
                        </div>
                      </div>
                    )}
                    {selectedGalaxyNode === 'lora' && (
                      <div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '0.92rem', color: '#fff', fontWeight: 700 }}>
                          Dynamic Orthogonal Rank Allocation with Continual Forgetting Bounds
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                          Current parameter-efficient fine-tuning fixes rank r uniformly across layers. Adaptive singular value truncation yields 4.2x parameter reduction on 70B models.
                        </p>
                        <div style={{ marginTop: 10, display: 'flex', gap: 10, fontSize: '0.72rem', color: '#4ade80' }}>
                          <span>Discovery Potential: 99.1%</span> • <span>Target Venue: ICML Oral</span>
                        </div>
                      </div>
                    )}
                    {selectedGalaxyNode === 'mamba' && (
                      <div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '0.92rem', color: '#fff', fontWeight: 700 }}>
                          Bidirectional State-Space Selective Scans with KV-Free Context
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                          SSMs eliminate the KV cache but struggle with in-context associative recall. A hybrid state router guarantees 10M token processing on consumer hardware.
                        </p>
                        <div style={{ marginTop: 10, display: 'flex', gap: 10, fontSize: '0.72rem', color: '#38bdf8' }}>
                          <span>Discovery Potential: 97.5%</span> • <span>Target Venue: NeurIPS Spotlight</span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 2: PYTHON WASM SANDBOX */}
              {activeEngineTab === 'python' && (
                <motion.div 
                  key="python"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="code-terminal-window"
                >
                  <div className="terminal-header-bar">
                    <div className="terminal-dots">
                      <span className="terminal-dot" style={{ background: '#ef4444' }} />
                      <span className="terminal-dot" style={{ background: '#eab308' }} />
                      <span className="terminal-dot" style={{ background: '#22c55e' }} />
                      <span style={{ marginLeft: 10, fontSize: '0.78rem', color: '#94a3b8' }}>
                        pyodide-wasm-sandbox • python 3.11 (zero server latency)
                      </span>
                    </div>
                    <button 
                      onClick={handleRunPython}
                      disabled={isRunningPython}
                      className="premium-btn-primary"
                      style={{ padding: '6px 16px', fontSize: '0.78rem', borderRadius: 10 }}
                    >
                      {isRunningPython ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} />}
                      {isRunningPython ? 'Executing in WASM...' : 'Run Simulation'}
                    </button>
                  </div>

                  <div className="code-editor-body">
                    <div><span className="code-keyword">import</span> torch</div>
                    <div><span className="code-keyword">import</span> numpy <span className="code-keyword">as</span> np</div>
                    <br />
                    <div><span className="code-comment"># Empirical Validation: FlashAttention-3 vs Standard O(N²) Attention</span></div>
                    <div><span className="code-keyword">def</span> <span className="code-fn">benchmark_flash_attention</span>(batch=1, heads=8, seq_len=4096, dim=64):</div>
                    <div style={{ paddingLeft: 20 }}>q = torch.randn(batch, heads, seq_len, dim)</div>
                    <div style={{ paddingLeft: 20 }}>k = torch.randn(batch, heads, seq_len, dim)</div>
                    <div style={{ paddingLeft: 20 }}>v = torch.randn(batch, heads, seq_len, dim)</div>
                    <div style={{ paddingLeft: 20 }}><span className="code-comment"># Tiled SRAM matrix multiplication bypasses quadratic HBM bandwidth</span></div>
                    <div style={{ paddingLeft: 20 }}>out = torch.nn.functional.scaled_dot_product_attention(q, k, v)</div>
                    <div style={{ paddingLeft: 20 }}><span className="code-keyword">return</span> out.shape, <span className="code-str">"Validation: 3.42x Speedup [PASS]"</span></div>
                  </div>

                  <div className="terminal-output-area">
                    {pythonOutput.map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 3: 4-AGENT SWARM ARENA */}
              {activeEngineTab === 'swarm' && (
                <motion.div 
                  key="swarm"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="swarm-debate-box"
                >
                  <div style={{ padding: '12px 18px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="status-dot-pulse" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e0e7ff' }}>
                        ACTIVE SWARM DEBATE: "Resolving KV-Cache Memory Wall in 1M Context Window Transformers"
                      </span>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Round 3 of 4 • Consensus Pending</span>
                  </div>

                  <div className="swarm-agent-card">
                    <div className="swarm-avatar" style={{ background: '#d97706' }}>Claude</div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <strong style={{ fontSize: '0.88rem', color: '#fff' }}>Anthropic Claude 3.5 Sonnet</strong>
                        <span style={{ fontSize: '0.7rem', color: '#fbbf24' }}>Theoretical Hypothesizer</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                        "I propose a sparse block-diagonal projection matrix that bounds KV-state memory growth logarithmically. Theorem 1 guarantees spectral radius preservation under arbitrary context sequence lengths."
                      </p>
                    </div>
                  </div>

                  <div className="swarm-agent-card">
                    <div className="swarm-avatar" style={{ background: '#dc2626' }}>Grok</div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <strong style={{ fontSize: '0.88rem', color: '#fff' }}>xAI Grok 2</strong>
                        <span style={{ fontSize: '0.7rem', color: '#f87171' }}>Adversarial Stress Tester</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                        "Adversarial counter-argument: While Theorem 1 holds in Euclidean Hilbert space, under float16 quantization on H100 SXM5, cumulative gradient vanishing occurs past 128k tokens. We must bound the condition number."
                      </p>
                    </div>
                  </div>

                  <div className="swarm-agent-card">
                    <div className="swarm-avatar" style={{ background: '#10b981' }}>GPT-4o</div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <strong style={{ fontSize: '0.88rem', color: '#fff' }}>OpenAI GPT-4o</strong>
                        <span style={{ fontSize: '0.7rem', color: '#34d399' }}>Mathematical Formalizer</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                        "Resolution derived: By applying a rotary norm clamp to the pre-softmax projection, the condition number is strictly bounded below κ ≤ 1.48. This completely prevents gradient decay across 1M tokens."
                      </p>
                    </div>
                  </div>

                  <div className="swarm-agent-card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(34,197,94,0.15))', borderColor: 'rgba(99,102,241,0.4)' }}>
                    <div className="swarm-avatar" style={{ background: '#6366f1' }}>Gemini</div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <strong style={{ fontSize: '0.88rem', color: '#fff' }}>Google Gemini 2.5 Flash</strong>
                        <span style={{ fontSize: '0.7rem', color: '#4ade80' }}>Area Chair Meta-Consensus</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                        "Consensus achieved. The synthesized theorem, PyTorch kernels, and empirical validation suite have been compiled and automatically injected into your Antigravity Code Studio project."
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: DUAL-HOST AUDIO STUDIO */}
              {activeEngineTab === 'podcast' && (
                <motion.div 
                  key="podcast"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="audio-studio-preview"
                >
                  <div style={{ padding: '16px 20px', background: 'rgba(15,18,28,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #a855f7, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Headphones size={22} style={{ color: '#fff' }} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#fff' }}>Episode 42: Deconstructing the Linear Attention Wall</h4>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Featuring Dr. Alex (Systems Lead) & Dr. Jordan (Theory Chair) • 14:28 min</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsPlayingAudioSim(!isPlayingAudioSim)}
                      className="premium-btn-primary"
                      style={{ padding: '8px 18px', fontSize: '0.82rem' }}
                    >
                      {isPlayingAudioSim ? <Pause size={14} /> : <Play size={14} />}
                      {isPlayingAudioSim ? 'Pause Podcast' : 'Play Live Audio'}
                    </button>
                  </div>

                  {/* Audio Wave Bars */}
                  <div className="wave-bars-container" style={{ opacity: isPlayingAudioSim ? 1 : 0.35 }}>
                    {Array.from({ length: 48 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="wave-bar" 
                        style={{ 
                          animationDelay: `${(i * 0.05) % 1.2}s`,
                          animationPlayState: isPlayingAudioSim ? 'running' : 'paused'
                        }} 
                      />
                    ))}
                  </div>

                  {/* Synced Transcript Bubbles */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderLeft: '4px solid #818cf8' }}>
                      <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#818cf8', marginBottom: 4 }}>DR. ALEX [HOST A - SYSTEMS]:</div>
                      <p style={{ margin: 0, fontSize: '0.84rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                        "What completely surprised me about Section 3 was the empirical VRAM measurement. Everyone assumed quadratic attention was inevitable for 1M tokens, but they proved you can tile the memory buffers directly onto SRAM."
                      </p>
                    </div>

                    <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', borderLeft: '4px solid #38bdf8' }}>
                      <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#38bdf8', marginBottom: 4 }}>DR. JORDAN [HOST B - THEORY]:</div>
                      <p style={{ margin: 0, fontSize: '0.84rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                        "Exactly, Alex! And when you look at the ablation table on page 8, the perplexity score barely drifted by 0.03. It's essentially free speedup with zero downstream degradation."
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 5: ADVERSARIAL PEER REVIEW */}
              {activeEngineTab === 'peer-review' && (
                <motion.div 
                  key="peer-review"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.74rem', color: '#a5b4fc', fontWeight: 700 }}>NEURIPS 2026 BENCHMARK REVIEW</span>
                      <h4 style={{ margin: '2px 0 0 0', fontSize: '0.96rem', color: '#fff' }}>Paper #8491: "Spectral Bounds for Finite-Precision State Space Models"</h4>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', fontSize: '0.78rem', fontWeight: 700 }}>
                      RECOMMENDED: ACCEPT (Oral Presentation)
                    </span>
                  </div>

                  <div className="peer-review-grid">
                    <div className="reviewer-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Reviewer 1</span>
                        <span className="reviewer-score-pill" style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80' }}>8 / 10 • Strong Accept</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Prof. Sterling • Theoretical Soundness</span>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                        "The proof for Lemma 3 is elegant. The bounding of the condition number κ via orthogonal transformation solves a longstanding gap in SSM theory."
                      </p>
                    </div>

                    <div className="reviewer-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Reviewer 2</span>
                        <span className="reviewer-score-pill" style={{ background: 'rgba(234,179,8,0.2)', color: '#facc15' }}>7 / 10 • Weak Accept</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Dr. Vance • Systems & Hardware Scale</span>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                        "Experiments on 8x H100 GPUs demonstrate 3.4x throughput improvement. Authors should include multi-node scaling ablations in the final camera-ready."
                      </p>
                    </div>

                    <div className="reviewer-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Reviewer 3</span>
                        <span className="reviewer-score-pill" style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80' }}>9 / 10 • Top 5%</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Dr. Lin • Reproducibility & Integrity</span>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                        "One-click Docker sandbox perfectly replicates Table 1 and Table 2. Zero retracted citations found. Comprehensive ethics disclosure included."
                      </p>
                    </div>
                  </div>

                  <div style={{ marginTop: 16, padding: '12px 18px', background: 'rgba(0,0,0,0.5)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                      Need to respond to reviewers? RMinios generates point-by-point rebuttal letters in 10 seconds.
                    </span>
                    <Link href="/dashboard/peer-review" className="premium-btn" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
                      Synthesize Rebuttal Package →
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* TAB 6: ACADEMIC VENTURE STUDIO */}
              {activeEngineTab === 'venture' && (
                <motion.div 
                  key="venture"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="venture-studio-card"
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ padding: '14px 18px', background: 'rgba(15,18,28,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14 }}>
                      <span style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 700 }}>AI COMMERCIALIZATION ENGINE</span>
                      <h3 style={{ margin: '4px 0 2px 0', fontSize: '1.25rem', color: '#fff', fontWeight: 800 }}>LinearBio Therapeutics Inc.</h3>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Spinout from Harvard / MIT Genomics Lab</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                      <div style={{ padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 10, textAlign: 'center' }}>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>TOTAL TAM</span>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>$38.4B</div>
                      </div>
                      <div style={{ padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 10, textAlign: 'center' }}>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>SERVICEABLE SAM</span>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#818cf8' }}>$7.2B</div>
                      </div>
                      <div style={{ padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 10, textAlign: 'center' }}>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>TARGET SOM</span>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#4ade80' }}>$850M</div>
                      </div>
                    </div>

                    <div style={{ padding: '12px 16px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10 }}>
                      <strong style={{ fontSize: '0.78rem', color: '#818cf8' }}>DEFENSIBLE TECHNICAL MOAT:</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                        Proprietary non-Euclidean linear attention operators hold 3 pending PCT patent applications, locking out commoditized transformer architectures.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(10,12,20,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14 }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: 700 }}>VC PITCH DECK AUTOMATICALLY GENERATED</span>
                      <h4 style={{ margin: '6px 0 12px 0', fontSize: '1rem', color: '#fff' }}>10-Slide Seed Presentation Ready</h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.78rem', color: '#cbd5e1' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={14} style={{ color: '#22c55e' }} /> Slide 1-3: The $38B Computational Drug Discovery Gap</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={14} style={{ color: '#22c55e' }} /> Slide 4-6: Empirical Proof & In-Browser WASM Validation</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={14} style={{ color: '#22c55e' }} /> Slide 7-9: Unit Economics, 86% Gross Margins & Go-to-Market</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={14} style={{ color: '#22c55e' }} /> Slide 10: $3.5M Seed Allocation & Milestone Roadmap</li>
                      </ul>
                    </div>

                    <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                      <Link href="/dashboard/venture" className="premium-btn-primary" style={{ padding: '8px 18px', fontSize: '0.82rem', width: '100%' }}>
                        Launch Pitch Deck Studio <Rocket size={14} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* =====================================================================
          FRONTIER MULTI-LLM FLEET SECTION
          ===================================================================== */}
      <section id="fleet" className="section-premium" style={{ background: '#05070d' }}>
        <h2 className="section-title">The Frontier Multi-LLM Fleet.</h2>
        <p className="section-subtitle">
          Never be constrained by a single model's biases. RMinios routes each reasoning phase to the best foundation model on Earth.
        </p>

        <div className="fleet-grid">
          {/* Card 1: Google Gemini */}
          <div className="fleet-card">
            <div className="fleet-card-glow" style={{ background: '#6366f1' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} style={{ color: '#818cf8' }} />
              </div>
              <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 8, background: 'rgba(34,197,94,0.15)', color: '#4ade80', fontWeight: 700 }}>
                ACTIVE ENGINE
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px 0', color: '#fff' }}>Google Gemini 2.5 Flash</h3>
            <span style={{ fontSize: '0.78rem', color: '#818cf8', fontWeight: 600, marginBottom: 12 }}>1,000,000 Token Context Window</span>
            <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, margin: '0 0 18px 0' }}>
              Sub-second temporal copilot with real-time clock awareness and massive PDF corpus ingestion. Powers Sara AI and real-time literature synthesis.
            </p>
            <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#94a3b8' }}>
              <span>Latency: <strong>&lt; 450ms</strong></span>
              <span>Reasoning: <strong>94.2%</strong></span>
            </div>
          </div>

          {/* Card 2: OpenAI GPT-4o */}
          <div className="fleet-card">
            <div className="fleet-card-glow" style={{ background: '#10b981' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={20} style={{ color: '#34d399' }} />
              </div>
              <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', fontWeight: 600 }}>
                REASONING
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px 0', color: '#fff' }}>OpenAI GPT-4o</h3>
            <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600, marginBottom: 12 }}>128,000 Token Context Window</span>
            <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, margin: '0 0 18px 0' }}>
              Specialized in discrete mathematics, theorem verification, and PyTorch architecture synthesis. Powers Antigravity Code Studio and mathematical proofs.
            </p>
            <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#94a3b8' }}>
              <span>Latency: <strong>&lt; 620ms</strong></span>
              <span>Code Gen: <strong>96.8%</strong></span>
            </div>
          </div>

          {/* Card 3: Anthropic Claude 3.5 */}
          <div className="fleet-card">
            <div className="fleet-card-glow" style={{ background: '#f59e0b' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={20} style={{ color: '#fbbf24' }} />
              </div>
              <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', fontWeight: 600 }}>
                ACADEMIC PROSE
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px 0', color: '#fff' }}>Claude 3.5 Sonnet</h3>
            <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 600, marginBottom: 12 }}>200,000 Token Context Window</span>
            <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, margin: '0 0 18px 0' }}>
              Flawless graduate-level scientific literature reviews, LaTeX equations, and philosophical depth. Powers paper authoring and Area Chair meta-verdicts.
            </p>
            <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#94a3b8' }}>
              <span>Latency: <strong>&lt; 580ms</strong></span>
              <span>Academic Tone: <strong>98.5%</strong></span>
            </div>
          </div>

          {/* Card 4: xAI Grok 2 */}
          <div className="fleet-card">
            <div className="fleet-card-glow" style={{ background: '#ef4444' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={20} style={{ color: '#f87171' }} />
              </div>
              <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', fontWeight: 600 }}>
                ADVERSARIAL
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px 0', color: '#fff' }}>xAI Grok 2</h3>
            <span style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 600, marginBottom: 12 }}>128,000 Token Context Window</span>
            <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, margin: '0 0 18px 0' }}>
              Uncompromising adversarial stress-testing. Challenges hypothesis assumptions, spots statistical flaws, and prepares authors for hostile peer review.
            </p>
            <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#94a3b8' }}>
              <span>Latency: <strong>&lt; 510ms</strong></span>
              <span>Stress-Test: <strong>97.1%</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          DEEP INNOVATION BENTO GRID
          ===================================================================== */}
      <section id="innovations" className="section-premium" style={{ background: '#000000' }}>
        <h2 className="section-title">Everything interconnected.</h2>
        <p className="section-subtitle">
          Ten unified autonomous systems replacing fragmented paper drafting, literature search, and computational biology stacks.
        </p>

        <div className="bento-grid">
          {/* Card 1: Scientific Integrity Shield */}
          <div className="glass-panel bento-item" style={{ gridColumn: 'span 7' }}>
            <div className="feature-icon-premium" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))', borderColor: 'rgba(34,197,94,0.3)' }}>
              <ShieldCheck size={24} style={{ color: '#4ade80' }} />
            </div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: 10, color: '#fff' }}>Scientific Integrity Shield</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: 520, fontSize: '0.92rem' }}>
              Instantly audit your research papers against 50,000+ retracted journal articles, verify DOI authenticity via Crossref, and detect hallucinated references before journal submission.
            </p>
            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <span style={{ fontSize: '0.74rem', padding: '4px 10px', borderRadius: 8, background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }}>
                ✓ Retracted DOI Detection
              </span>
              <span style={{ fontSize: '0.74rem', padding: '4px 10px', borderRadius: 8, background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}>
                ✓ Conflict of Interest Audit
              </span>
            </div>
          </div>

          {/* Card 2: Deep Work Soundscape & Dynamic Island */}
          <div className="glass-panel bento-item" style={{ gridColumn: 'span 5' }}>
            <div className="feature-icon-premium" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.05))', borderColor: 'rgba(168,85,247,0.3)' }}>
              <Headphones size={24} style={{ color: '#c084fc' }} />
            </div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: 10, color: '#fff' }}>Deep Work Soundscape Studio</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontSize: '0.92rem' }}>
              Native background binaural audio induction (Alpha 10Hz, Theta 6Hz, Gamma 40Hz) integrated seamlessly with Spotify and Apple-style Dynamic Island controls.
            </p>
            <div style={{ marginTop: 20 }}>
              <span style={{ fontSize: '0.74rem', padding: '4px 10px', borderRadius: 8, background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.25)' }}>
                ✓ Continuous Spotify Search & Queue
              </span>
            </div>
          </div>

          {/* Card 3: Autonomous Grant Intelligence */}
          <div className="glass-panel bento-item" style={{ gridColumn: 'span 4' }}>
            <div className="feature-icon-premium" style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(56,189,248,0.05))', borderColor: 'rgba(56,189,248,0.3)' }}>
              <Target size={24} style={{ color: '#38bdf8' }} />
            </div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: 10, color: '#fff' }}>$500M+ Grant Radar</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontSize: '0.92rem' }}>
              AI cross-matches your proposal against active funding calls from NSF, NIH, DARPA, and Horizon Europe, synthesizing tailored milestone roadmaps.
            </p>
          </div>

          {/* Card 4: Global Pre-Print Literature Radar */}
          <div className="glass-panel bento-item" style={{ gridColumn: 'span 4' }}>
            <div className="feature-icon-premium" style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.2), rgba(234,179,8,0.05))', borderColor: 'rgba(234,179,8,0.3)' }}>
              <Radio size={24} style={{ color: '#facc15' }} />
            </div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: 10, color: '#fff' }}>Global Literature Radar</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontSize: '0.92rem' }}>
              Streaming live arXiv and bioRxiv pre-prints with automated citation trend analysis, algorithmic clustering, and daily scientific briefings.
            </p>
          </div>

          {/* Card 5: Antigravity Code Studio */}
          <div className="glass-panel bento-item" style={{ gridColumn: 'span 4' }}>
            <div className="feature-icon-premium" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(99,102,241,0.05))', borderColor: 'rgba(99,102,241,0.3)' }}>
              <Terminal size={24} style={{ color: '#818cf8' }} />
            </div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: 10, color: '#fff' }}>Antigravity Code Studio</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontSize: '0.92rem' }}>
              Autonomous software developer agent creating multi-file PyTorch models, data loaders, automated testing harnesses, and synthetic training loops.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================================
          ARCHITECTURE PIPELINE FLOW
          ===================================================================== */}
      <section id="architecture" className="section-premium" style={{ background: '#070911', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="section-title">Engineered from Silicon to Publication.</h2>
        <p className="section-subtitle">
          How raw pre-prints transform into verified code, peer-reviewed science, and venture-backed startups in a continuous autonomous pipeline.
        </p>

        <div className="architecture-timeline">
          <div className="pipeline-step-card">
            <span className="pipeline-step-num">01</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>Multimodal Ingestion</h3>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
              Drop PDFs, LaTeX files, or raw datasets. High-dimensional vector embeddings (gemini-embedding-001) index semantic chunks in Supabase pgvector.
            </p>
          </div>

          <div className="pipeline-step-card">
            <span className="pipeline-step-num">02</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>Swarm Debate & Gap Discovery</h3>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
              Claude 3.5, GPT-4o, and Grok 2 debate hypotheses across 3D Citation Constellations, pinpointing unexplored scientific white spaces.
            </p>
          </div>

          <div className="pipeline-step-card">
            <span className="pipeline-step-num">03</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>In-Browser Empirical Proof</h3>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
              Pyodide WebAssembly executes PyTorch code directly in the client's browser, validating mathematical proofs with zero server compute latency.
            </p>
          </div>

          <div className="pipeline-step-card">
            <span className="pipeline-step-num">04</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>Peer Review & Venture Spinout</h3>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
              3 adversarial reviewers stress-test the paper, generating camera-ready LaTeX, while Venture Studio outputs 10-slide VC pitch decks.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================================
          COMPETITIVE COMPARISON MATRIX
          ===================================================================== */}
      <section className="section-premium" style={{ background: '#000000' }}>
        <h2 className="section-title">Why RMinios Replaces Legacy Tools.</h2>
        <p className="section-subtitle">
          Stop juggling 6 disconnected browser tabs for literature search, coding, paper formatting, and music.
        </p>

        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th style={{ width: '32%' }}>Capabilities</th>
                <th className="rminios-col-highlight" style={{ width: '22%' }}>⚡ RMinios OS 2.5</th>
                <th style={{ width: '15%' }}>Overleaf</th>
                <th style={{ width: '15%' }}>ChatGPT Plus</th>
                <th style={{ width: '16%' }}>Semantic Scholar</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Frontier Multi-LLM Swarm Debate</strong></td>
                <td className="rminios-col-highlight"><Check size={18} style={{ color: '#22c55e' }} /> 4 Models Synced</td>
                <td><X size={18} style={{ color: '#ef4444' }} /></td>
                <td><X size={18} style={{ color: '#ef4444' }} /> Single Model</td>
                <td><X size={18} style={{ color: '#ef4444' }} /></td>
              </tr>
              <tr>
                <td><strong>3D Citation Constellation (WebGL)</strong></td>
                <td className="rminios-col-highlight"><Check size={18} style={{ color: '#22c55e' }} /> Real-Time 3D Graph</td>
                <td><X size={18} style={{ color: '#ef4444' }} /></td>
                <td><X size={18} style={{ color: '#ef4444' }} /></td>
                <td>2D Static Graph</td>
              </tr>
              <tr>
                <td><strong>Client-Side Python WASM Sandbox</strong></td>
                <td className="rminios-col-highlight"><Check size={18} style={{ color: '#22c55e' }} /> Pyodide 3.11</td>
                <td><X size={18} style={{ color: '#ef4444' }} /></td>
                <td>Cloud Python (Delayed)</td>
                <td><X size={18} style={{ color: '#ef4444' }} /></td>
              </tr>
              <tr>
                <td><strong>Adversarial NeurIPS Peer Review</strong></td>
                <td className="rminios-col-highlight"><Check size={18} style={{ color: '#22c55e' }} /> 3-Reviewer Committee</td>
                <td><X size={18} style={{ color: '#ef4444' }} /></td>
                <td><X size={18} style={{ color: '#ef4444' }} /></td>
                <td><X size={18} style={{ color: '#ef4444' }} /></td>
              </tr>
              <tr>
                <td><strong>Academic-to-Startup Venture Studio</strong></td>
                <td className="rminios-col-highlight"><Check size={18} style={{ color: '#22c55e' }} /> TAM/SAM & VC Decks</td>
                <td><X size={18} style={{ color: '#ef4444' }} /></td>
                <td><X size={18} style={{ color: '#ef4444' }} /></td>
                <td><X size={18} style={{ color: '#ef4444' }} /></td>
              </tr>
              <tr>
                <td><strong>Deep Work Audio & Dynamic Island</strong></td>
                <td className="rminios-col-highlight"><Check size={18} style={{ color: '#22c55e' }} /> Binaural + Spotify</td>
                <td><X size={18} style={{ color: '#ef4444' }} /></td>
                <td><X size={18} style={{ color: '#ef4444' }} /></td>
                <td><X size={18} style={{ color: '#ef4444' }} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* =====================================================================
          PRICING SECTION
          ===================================================================== */}
      <section id="pricing" className="section-premium" style={{ background: '#060810' }}>
        <h2 className="section-title">Transparent, Predictable Value.</h2>
        <p className="section-subtitle">
          Start for free with guest access and free accounts. Upgrade when your laboratory demands frontier swarm computing.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 24, maxWidth: 1080, margin: '0 auto' }}>
          {/* Free Tier */}
          <div className="glass-panel" style={{ padding: 36, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', margin: '0 0 6px 0' }}>Independent Researcher</h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 20 }}>For students, independent scholars, and hobbyists</span>
            <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 24 }}>$0<span style={{ fontSize: '1rem', color: '#888', fontWeight: 400 }}> / month</span></div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: 14, color: '#cbd5e1', fontSize: '0.86rem' }}>
              <li style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} style={{ color: '#22c55e' }} /> 5 Persistent Research Workspaces</li>
              <li style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} style={{ color: '#22c55e' }} /> In-Browser Pyodide Python WASM</li>
              <li style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} style={{ color: '#22c55e' }} /> Interactive 3D Citation Constellation</li>
              <li style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} style={{ color: '#22c55e' }} /> Sara AI Copilot (Real-Time Temporal Engine)</li>
              <li style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} style={{ color: '#22c55e' }} /> Deep Work Audio & Spotify Island</li>
            </ul>
            
            <Link href="/signup" className="premium-btn" style={{ marginTop: 'auto', width: '100%' }}>
              Get Started Free
            </Link>
          </div>

          {/* Fellow Tier (Most Popular) */}
          <div className="glass-panel" style={{ padding: 36, display: 'flex', flexDirection: 'column', border: '1px solid rgba(99,102,241,0.5)', background: 'rgba(99,102,241,0.06)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '5px 16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', fontSize: '0.72rem', fontWeight: 700, borderBottomLeftRadius: 14, color: '#fff' }}>
              MOST POPULAR
            </div>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: '0 0 6px 0' }}>Fellow & Lab Scientist</h3>
            <span style={{ fontSize: '0.8rem', color: '#a5b4fc', marginBottom: 20 }}>For PhD candidates, postdocs, and research labs</span>
            <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 24, color: '#fff' }}>$29<span style={{ fontSize: '1rem', color: '#888', fontWeight: 400 }}> / month</span></div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: 14, color: '#e2e8f0', fontSize: '0.86rem' }}>
              <li style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} style={{ color: '#38bdf8' }} /> Unlimited Research Papers & Workspaces</li>
              <li style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} style={{ color: '#38bdf8' }} /> 4-Agent Swarm Arena (GPT-4o, Claude, Grok, Gemini)</li>
              <li style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} style={{ color: '#38bdf8' }} /> Adversarial NeurIPS Peer Review & Rebuttal Generator</li>
              <li style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} style={{ color: '#38bdf8' }} /> Dual-Host NotebookLM Audio Studio & Wave Synthesis</li>
              <li style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} style={{ color: '#38bdf8' }} /> Academic-to-Startup Venture Studio & Pitch Decks</li>
              <li style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} style={{ color: '#38bdf8' }} /> Active $500M+ NSF / NIH Grant Matching Radar</li>
            </ul>
            
            <Link href="/signup" className="premium-btn-primary" style={{ marginTop: 'auto', width: '100%' }}>
              Upgrade to Fellow Plan
            </Link>
          </div>

          {/* Enterprise / Institution */}
          <div className="glass-panel" style={{ padding: 36, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', margin: '0 0 6px 0' }}>University & Enterprise</h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 20 }}>For universities, biotech firms, and enterprise R&D</span>
            <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 24 }}>$99<span style={{ fontSize: '1rem', color: '#888', fontWeight: 400 }}> / month</span></div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: 14, color: '#cbd5e1', fontSize: '0.86rem' }}>
              <li style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} style={{ color: '#22c55e' }} /> Unlimited Team Members & Multi-User Collaboration</li>
              <li style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} style={{ color: '#22c55e' }} /> Dedicated Private Cloud VPC or On-Premise Host</li>
              <li style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} style={{ color: '#22c55e' }} /> Bring-Your-Own-Key (BYOK) Custom Model Routing</li>
              <li style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} style={{ color: '#22c55e' }} /> Priority 24/7 Dedicated Research Engineer SLA</li>
            </ul>
            
            <Link href="/support" className="premium-btn" style={{ marginTop: 'auto', width: '100%' }}>
              Contact Lab Solutions
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          INTERACTIVE FAQ ACCORDION
          ===================================================================== */}
      <section id="faq" className="section-premium" style={{ background: '#000000' }}>
        <h2 className="section-title">Frequently Asked Questions.</h2>
        <p className="section-subtitle">
          Everything you need to know about the architecture, execution security, and model fleet.
        </p>

        <div className="faq-container">
          {[
            {
              q: "How does the in-browser Python sandbox run with zero server latency?",
              a: "RMinios uses Pyodide, an Emscripten-compiled WebAssembly port of CPython 3.11 with NumPy and PyTorch micro-kernels. Execution runs 100% locally inside your web browser's isolated WASM sandbox, guaranteeing instantaneous runtimes, zero cloud queuing, and absolute data privacy."
            },
            {
              q: "Can I bring my own API keys for OpenAI, Anthropic, or xAI Grok?",
              a: "Yes! RMinios includes full Bring-Your-Own-Key (BYOK) support. You can input your private API keys in Settings or Sara Copilot, and they are saved client-side in encrypted localStorage without touching our database."
            },
            {
              q: "How does the Adversarial Peer Review Committee prevent synthetic hallucinations?",
              a: "Our committee orchestrates three specialized reviewer personas with adversarial prompts tuned to NeurIPS and ICML review criteria. Furthermore, the Scientific Integrity Shield cross-checks every cited DOI against Crossref and RetractionWatch databases before rendering a meta-review verdict."
            },
            {
              q: "Can I export my research papers to Overleaf and arXiv LaTeX?",
              a: "Absolutely. All papers written in RMinios can be exported with one click into camera-ready LaTeX .tex zip archives with BibTeX bibliographies, formatted Word .docx files, or publication-grade PDF documents."
            },
            {
              q: "Is Sara AI Copilot available without signing up?",
              a: "Yes! Sara is accessible directly from the bottom-right orb on this landing page in free preview mode (3 free questions), featuring native real-time clock awareness and multi-LLM fleet navigation. Creating a free account unlocks unlimited questions."
            }
          ].map((item, idx) => (
            <div key={idx} className="faq-item">
              <button 
                className="faq-question-btn"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              >
                <span>{item.q}</span>
                <ChevronDown 
                  size={18} 
                  style={{ 
                    transform: activeFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease',
                    color: activeFaq === idx ? '#818cf8' : 'rgba(255,255,255,0.5)'
                  }} 
                />
              </button>
              {activeFaq === idx && (
                <div className="faq-answer-body">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          ENTERPRISE FOOTER WITH DYNAMIC SUPPORT DETAILS
          ===================================================================== */}
      <footer style={{ padding: '80px 40px 50px', borderTop: '1px solid rgba(255,255,255,0.08)', background: '#040508', position: 'relative', zIndex: 20 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40, marginBottom: 50 }}>
          {/* Brand Col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={18} style={{ color: '#fff' }} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>RMinios</span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>
              The Research Operating System designed to accelerate discovery from literature gap to published paper and deep-tech venture spinout.
            </p>
            <div className="status-pill-live" style={{ width: 'fit-content', marginTop: 6 }}>
              <span className="status-dot-pulse" />
              <span>All 52 Platform Engines Operational</span>
            </div>
          </div>

          {/* Quick Engines Col */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginBottom: 14 }}>Engines & Tools</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9, fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
              <li><Link href="/dashboard/galaxy" style={{ color: 'inherit', textDecoration: 'none' }}>3D Citation Galaxy</Link></li>
              <li><Link href="/dashboard/sandbox" style={{ color: 'inherit', textDecoration: 'none' }}>Pyodide Python Sandbox</Link></li>
              <li><Link href="/dashboard/swarm" style={{ color: 'inherit', textDecoration: 'none' }}>4-Agent Swarm Arena</Link></li>
              <li><Link href="/dashboard/podcast" style={{ color: 'inherit', textDecoration: 'none' }}>Dual-Host Audio Studio</Link></li>
              <li><Link href="/dashboard/peer-review" style={{ color: 'inherit', textDecoration: 'none' }}>Adversarial Peer Review</Link></li>
              <li><Link href="/dashboard/venture" style={{ color: 'inherit', textDecoration: 'none' }}>Academic Venture Studio</Link></li>
            </ul>
          </div>

          {/* Discovery & Grants Col */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginBottom: 14 }}>Intelligence & Integrity</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9, fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
              <li><Link href="/dashboard/integrity" style={{ color: 'inherit', textDecoration: 'none' }}>Scientific Integrity Shield</Link></li>
              <li><Link href="/dashboard/grants" style={{ color: 'inherit', textDecoration: 'none' }}>$500M+ Grant Radar</Link></li>
              <li><Link href="/dashboard/radar" style={{ color: 'inherit', textDecoration: 'none' }}>Global Literature Radar</Link></li>
              <li><Link href="/dashboard/codestudio" style={{ color: 'inherit', textDecoration: 'none' }}>Antigravity Code Studio</Link></li>
              <li><Link href="/support" style={{ color: 'inherit', textDecoration: 'none' }}>Support & Documentation</Link></li>
            </ul>
          </div>

          {/* Owner & Support Col */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginBottom: 14 }}>Owner & Support</h4>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
              <div>Creator: <strong>{siteSettings.owner_name}</strong></div>
              <div>Support: <a href={`mailto:${siteSettings.support_email}`} style={{ color: '#38bdf8', textDecoration: 'none' }}>{siteSettings.support_email}</a></div>
              <div>Direct: <strong>{siteSettings.support_phone}</strong></div>
              <div style={{ marginTop: 10 }}>
                <Link href="/support" className="premium-btn" style={{ padding: '6px 14px', fontSize: '0.76rem' }}>
                  Open Help Ticket →
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1180, margin: '0 auto', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>
          <div>© 2026 RMinios OS. All rights reserved. Built for the frontier of scientific research.</div>
          <div style={{ display: 'flex', gap: 18 }}>
            <Link href="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Sign In</Link>
            <Link href="/signup" style={{ color: 'inherit', textDecoration: 'none' }}>Create Account</Link>
            <Link href="/support" style={{ color: 'inherit', textDecoration: 'none' }}>Support Center</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
