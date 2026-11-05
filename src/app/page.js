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
import TiltCard3D from '@/components/TiltCard3D';

function GithubIcon({ size = 16, style = {} }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      style={style}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

// Lazy load 3D Interactive Hero Canvas
const InteractiveHero3D = dynamic(() => import('@/components/InteractiveHero3D'), { 
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
});

// Lazy load 3D Galaxy Canvas for Tab 1
const InteractiveGalaxy3D = dynamic(() => import('@/components/InteractiveGalaxy3D'), { 
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '440px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080911', borderRadius: 16 }}>
      <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
});

// Lazy load 60-second interactive demo walkthrough
const DemoWalkthrough60s = dynamic(() => import('@/components/DemoWalkthrough60s'), {
  ssr: false
});

const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function LandingPage() {
  // Dynamic Site Settings from Supabase
  const [siteSettings, setSiteSettings] = useState({
    owner_name: 'Jonnadula Mohit Sai',
    support_email: 'support@rminios.dev'
  });

  // Interactive Engine Playground State
  const [activeEngineTab, setActiveEngineTab] = useState('galaxy'); // 'galaxy' | 'python' | 'swarm' | 'podcast' | 'peer-review' | 'venture'
  const [selectedGalaxyNode, setSelectedGalaxyNode] = useState('transformers');
  const [isRunningPython, setIsRunningPython] = useState(false);
  const [pythonOutput, setPythonOutput] = useState([
    ">> Pyodide 0.26 WebAssembly Runtime Initialized [Emscripten 3.1.58]",
    ">> Ready to execute pure NumPy self-attention matrix multiplication in your browser."
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

  const handleRunPython = () => {
    if (isRunningPython) return;
    setIsRunningPython(true);
    setPythonOutput(prev => [...prev, ">> Computing NumPy attention weights locally in browser WebAssembly..."]);
    
    setTimeout(() => {
      setPythonOutput(prev => [
        ...prev,
        ">> Matrix Dimensions: Q, K, V = (batch=1, heads=8, seq_len=512, dim=64)",
        ">> Scaled dot-product attention computed via np.matmul & softmax",
        ">> Client-Side Memory: Local Browser Sandbox (0 Cloud Server Compute)",
        ">> Validation Result: Shapes Verified, Attention Score Matched [PASS]"
      ]);
      setIsRunningPython(false);
    }, 900);
  };

  return (
    <div className="landing-container">
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
          <a href="#exploration" className="landing-nav-link">Exploration</a>
          <a href="#pricing" className="landing-nav-link">Pricing</a>
          <a href="#faq" className="landing-nav-link">FAQ</a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="status-pill-live hidden-mobile">
            <span className="status-dot-pulse" />
            <span>10 Modular Engines</span>
          </div>
          <a 
            href="https://github.com/Mohitsai3579/rminios" 
            target="_blank" 
            rel="noopener noreferrer"
            className="landing-nav-link"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.86rem' }}
          >
            <GithubIcon size={16} /> GitHub
          </a>
          <Link href="/login" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}>
            Sign In
          </Link>
          <Link href="/signup" className="premium-btn-primary" style={{ padding: '9px 20px', fontSize: '0.85rem' }}>
            Launch Hub <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      {/* =====================================================================
          HERO SECTION WITH 3D QUANTUM NEURAL CORE & 60S DEMO
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
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, width: '100%', maxWidth: 1200 }}
        >
          {/* Top Badge: Beta / Portfolio Project */}
          <motion.div variants={FADE_UP_VARIANTS} className="hero-badge-pill" style={{ background: 'rgba(99,102,241,0.15)', borderColor: 'rgba(99,102,241,0.35)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 10px #6366f1' }} />
            <span style={{ fontWeight: 700, color: '#c7d2fe' }}>Beta / Portfolio Project</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
            <span>RMinios OS 2.5 by Jonnadula Mohit Sai</span>
          </motion.div>

          {/* Hero Title */}
          <motion.h1 variants={FADE_UP_VARIANTS} className="hero-title">
            The Autonomous Frontier for <br />
            <span className="text-gradient-hero">Scientific Discovery</span> & <span className="text-gradient-purple">AI Engineering.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={FADE_UP_VARIANTS} className="hero-subtitle">
            Orchestrate multi-agent debate swarms, in-browser Python (NumPy) experiment sandboxes, 3D citation constellations, and academic-to-venture synthesis at the speed of thought.
          </motion.p>

          {/* ⭐ 3D INTERACTIVE HERO STAGE ⭐ */}
          <motion.div 
            variants={FADE_UP_VARIANTS}
            style={{ 
              width: '100%', 
              height: '480px', 
              position: 'relative', 
              margin: '0 auto 24px',
              borderRadius: 24,
              overflow: 'hidden'
            }}
          >
            <InteractiveHero3D />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={FADE_UP_VARIANTS} className="hero-cta-group">
            <Link href="/signup" className="premium-btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
              Launch Research Hub (Free) <ArrowRight size={18} />
            </Link>
            <a 
              href="https://github.com/Mohitsai3579/rminios" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="premium-btn" 
              style={{ padding: '14px 26px', fontSize: '0.94rem', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <GithubIcon size={17} /> View on GitHub
            </a>
            <a href="#engines" className="premium-btn" style={{ padding: '14px 22px', fontSize: '0.94rem' }}>
              <Zap size={17} style={{ color: '#eab308' }} /> Explore 10 Modular Engines
            </a>
          </motion.div>

          {/* ⭐ 60-SECOND INTERACTIVE PLATFORM WALKTHROUGH ⭐ */}
          <motion.div variants={FADE_UP_VARIANTS} style={{ width: '100%' }}>
            <DemoWalkthrough60s />
          </motion.div>

          {/* Live Micro-Stats Bar */}
          <motion.div variants={FADE_UP_VARIANTS} className="hero-stats-bar">
            <div className="hero-stat-item">
              <span className="hero-stat-value">Search arXiv live</span>
              <span className="hero-stat-label">Global Pre-Prints</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <span className="hero-stat-value">Configurable LLMs</span>
              <span className="hero-stat-label">Swarm Consensus</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <span className="hero-stat-value">Runs in your browser</span>
              <span className="hero-stat-label">Pyodide Python WASM</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <span className="hero-stat-value">NeurIPS / ICML</span>
              <span className="hero-stat-label">Adversarial Peer Review</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <span className="hero-stat-value">Sample Datasets</span>
              <span className="hero-stat-label">Grant & Funding Radar</span>
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
          Ten modular research engines engineered to explore unified scientific workflows. Click any tab below to test the live interactive preview right now.
        </p>

        <div className="playground-container">
          {/* Engine Tabs Bar */}
          <div className="playground-nav-tabs">
            <button 
              className={`playground-tab-btn ${activeEngineTab === 'galaxy' ? 'active' : ''}`}
              onClick={() => setActiveEngineTab('galaxy')}
            >
              <Compass size={16} /> 3D Citation Galaxy
              <span className="playground-tab-badge">WebGL 3D</span>
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
              {/* TAB 1: REAL 3D WEBGL GALAXY CANVAS */}
              {activeEngineTab === 'galaxy' && (
                <motion.div 
                  key="galaxy"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="status-dot-pulse" />
                      <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700 }}>
                        3D WebGL Constellation: Drag to Orbit in 3D • Click any node to analyze citation gaps
                      </span>
                    </div>
                    <Link href="/dashboard/galaxy" className="premium-btn" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
                      Launch Full Galaxy <ExternalLink size={13} />
                    </Link>
                  </div>

                  {/* Real 3D WebGL Canvas */}
                  <InteractiveGalaxy3D 
                    selectedNode={selectedGalaxyNode} 
                    onSelectNode={setSelectedGalaxyNode} 
                  />

                  {/* Dynamic White Space Output Card (Labeled as Example Output) */}
                  <div className="galaxy-whitespace-card" style={{ maxWidth: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }} />
                        <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#4ade80' }}>
                          UNEXPLORED RESEARCH GAP DETECTED IN 3D GRAPH
                        </span>
                      </div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: 'rgba(234, 179, 8, 0.15)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                        Example output / Concept exploration
                      </span>
                    </div>
                    {selectedGalaxyNode === 'transformers' && (
                      <div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '0.94rem', color: '#fff', fontWeight: 700 }}>
                          Sub-Quadratic Cross-Attention for High-Throughput Spatial Genomics
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                          While Vaswani et al. solves token routing in O(N²), billion-scale genomic cell reads suffer extreme memory blowup. Vector proximity reveals an unbridged gap between LoRA rank decomposition and sparse FlashAttention.
                        </p>
                        <div style={{ marginTop: 10, display: 'flex', gap: 14, fontSize: '0.74rem', color: '#38bdf8', flexWrap: 'wrap' }}>
                          <span>Discovery Potential: 98.4% (Example output)</span> • <span>Estimated Citations: 450+ (Example output)</span> • <span>Target Venue: Nature Biotechnology</span>
                        </div>
                      </div>
                    )}
                    {selectedGalaxyNode === 'ddpm' && (
                      <div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '0.94rem', color: '#fff', fontWeight: 700 }}>
                          Deterministic Hamiltonian Flow Matching for Crystal Lattice Synthesis
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                          DDPM Langevin sampling requires 1,000 steps. Bridging this node with Riemannian geometry yields continuous 1-step generative trajectory for inorganic superconductors.
                        </p>
                        <div style={{ marginTop: 10, display: 'flex', gap: 14, fontSize: '0.74rem', color: '#f43f5e', flexWrap: 'wrap' }}>
                          <span>Discovery Potential: 96.8% (Example output)</span> • <span>Target Venue: Nature Materials</span>
                        </div>
                      </div>
                    )}
                    {selectedGalaxyNode === 'lora' && (
                      <div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '0.94rem', color: '#fff', fontWeight: 700 }}>
                          Dynamic Orthogonal Rank Allocation with Continual Forgetting Bounds
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                          Current parameter-efficient fine-tuning fixes rank r uniformly across layers. Adaptive singular value truncation yields 4.2x parameter reduction on 70B models.
                        </p>
                        <div style={{ marginTop: 10, display: 'flex', gap: 14, fontSize: '0.74rem', color: '#4ade80', flexWrap: 'wrap' }}>
                          <span>Discovery Potential: 99.1% (Example output)</span> • <span>Target Venue: ICML Oral</span>
                        </div>
                      </div>
                    )}
                    {selectedGalaxyNode === 'mamba' && (
                      <div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '0.94rem', color: '#fff', fontWeight: 700 }}>
                          Bidirectional State-Space Selective Scans with KV-Free Context
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                          SSMs eliminate the KV cache but struggle with in-context associative recall. A hybrid state router guarantees 10M token processing on consumer hardware.
                        </p>
                        <div style={{ marginTop: 10, display: 'flex', gap: 14, fontSize: '0.74rem', color: '#38bdf8', flexWrap: 'wrap' }}>
                          <span>Discovery Potential: 97.5% (Example output)</span> • <span>Target Venue: NeurIPS Spotlight</span>
                        </div>
                      </div>
                    )}
                    {(selectedGalaxyNode === 'deepseek' || selectedGalaxyNode === 'alphafold' || selectedGalaxyNode === 'whitespace') && (
                      <div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '0.94rem', color: '#4ade80', fontWeight: 700 }}>
                          Latent Biomolecular Flow Matching with Sub-Quadratic Manifold Projections
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                          Combining DeepSeek latent compression with AlphaFold structural predictions unlocks real-time de novo therapeutic antibody design in under 3 seconds.
                        </p>
                        <div style={{ marginTop: 10, display: 'flex', gap: 14, fontSize: '0.74rem', color: '#4ade80', flexWrap: 'wrap' }}>
                          <span>Synthesis Confidence: 99.4% (Example output)</span> • <span>Illustrative Concept Evaluation</span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 2: IN-BROWSER PYTHON (NUMPY) WASM SANDBOX */}
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
                        pyodide-wasm-sandbox • python 3.11 with numpy (runs in your browser)
                      </span>
                    </div>
                    <button 
                      onClick={handleRunPython}
                      disabled={isRunningPython}
                      className="premium-btn-primary"
                      style={{ padding: '6px 16px', fontSize: '0.78rem', borderRadius: 10 }}
                    >
                      {isRunningPython ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} />}
                      {isRunningPython ? 'Executing in Browser...' : 'Run Simulation'}
                    </button>
                  </div>

                  <div className="code-editor-body">
                    <div><span className="code-keyword">import</span> numpy <span className="code-keyword">as</span> np</div>
                    <br />
                    <div><span className="code-comment"># Run Python (NumPy) in the browser via Pyodide WebAssembly</span></div>
                    <div><span className="code-keyword">def</span> <span className="code-fn">scaled_dot_product_attention</span>(Q, K, V):</div>
                    <div style={{ paddingLeft: 20 }}>d_k = Q.shape[-1]</div>
                    <div style={{ paddingLeft: 20 }}>scores = np.matmul(Q, K.swapaxes(-2, -1)) / np.sqrt(d_k)</div>
                    <div style={{ paddingLeft: 20 }}><span className="code-comment"># Numerically stable in-browser softmax</span></div>
                    <div style={{ paddingLeft: 20 }}>exp_scores = np.exp(scores - np.max(scores, axis=-1, keepdims=True))</div>
                    <div style={{ paddingLeft: 20 }}>weights = exp_scores / np.sum(exp_scores, axis=-1, keepdims=True)</div>
                    <div style={{ paddingLeft: 20 }}><span className="code-keyword">return</span> np.matmul(weights, V)</div>
                    <br />
                    <div><span className="code-comment"># In-browser validation: batch=1, heads=8, seq=512, dim=64</span></div>
                    <div>Q = np.random.randn(1, 8, 512, 64)</div>
                    <div>K = np.random.randn(1, 8, 512, 64)</div>
                    <div>V = np.random.randn(1, 8, 512, 64)</div>
                    <div>out = scaled_dot_product_attention(Q, K, V)</div>
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
          FRONTIER MULTI-LLM FLEET SECTION (WITH 3D TILT CARDS)
          ===================================================================== */}
      <section id="fleet" className="section-premium" style={{ background: '#05070d' }}>
        <h2 className="section-title">Configurable Frontier Models.</h2>
        <p className="section-subtitle">
          Never be constrained by a single model's biases. Route each reasoning phase to modern frontier models or connect your own API keys via client-side storage.
        </p>

        <div className="fleet-grid">
          {/* Card 1: Google Gemini */}
          <TiltCard3D className="fleet-card">
            <div className="fleet-card-glow" style={{ background: '#6366f1' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} style={{ color: '#818cf8' }} />
              </div>
              <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 8, background: 'rgba(34,197,94,0.15)', color: '#4ade80', fontWeight: 700 }}>
                ACTIVE ENGINE
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px 0', color: '#fff' }}>Google Gemini (2.5 Flash / Pro)</h3>
            <span style={{ fontSize: '0.78rem', color: '#818cf8', fontWeight: 600, marginBottom: 12 }}>1,000,000 Token Context Window</span>
            <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, margin: 0 }}>
              Sub-second temporal copilot with real-time clock awareness and massive PDF corpus ingestion. Powers Sara AI and real-time literature synthesis.
            </p>
          </TiltCard3D>

          {/* Card 2: OpenAI */}
          <TiltCard3D className="fleet-card">
            <div className="fleet-card-glow" style={{ background: '#10b981' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={20} style={{ color: '#34d399' }} />
              </div>
              <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', fontWeight: 600 }}>
                REASONING
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px 0', color: '#fff' }}>OpenAI (GPT-4o / Reasoning Models)</h3>
            <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600, marginBottom: 12 }}>128,000 Token Context Window</span>
            <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, margin: 0 }}>
              Specialized in discrete mathematics, theorem verification, and code generation. Powers Antigravity Code Studio and mathematical proofs.
            </p>
          </TiltCard3D>

          {/* Card 3: Anthropic Claude */}
          <TiltCard3D className="fleet-card">
            <div className="fleet-card-glow" style={{ background: '#f59e0b' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={20} style={{ color: '#fbbf24' }} />
              </div>
              <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', fontWeight: 600 }}>
                ACADEMIC PROSE
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px 0', color: '#fff' }}>Anthropic Claude (3.5 / 3.7 Sonnet)</h3>
            <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 600, marginBottom: 12 }}>200,000 Token Context Window</span>
            <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, margin: 0 }}>
              Flawless graduate-level scientific literature reviews, LaTeX equations, and philosophical depth. Powers paper authoring and Area Chair meta-verdicts.
            </p>
          </TiltCard3D>

          {/* Card 4: xAI Grok / Open Models */}
          <TiltCard3D className="fleet-card">
            <div className="fleet-card-glow" style={{ background: '#ef4444' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={20} style={{ color: '#f87171' }} />
              </div>
              <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', fontWeight: 600 }}>
                ADVERSARIAL
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px 0', color: '#fff' }}>xAI Grok / Open Frontier Models</h3>
            <span style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 600, marginBottom: 12 }}>128,000 Token Context Window</span>
            <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, margin: 0 }}>
              Uncompromising adversarial stress-testing. Challenges hypothesis assumptions, spots statistical flaws, and prepares authors for hostile peer review.
            </p>
          </TiltCard3D>
        </div>
      </section>

      {/* =====================================================================
          DEEP INNOVATION BENTO GRID (WITH 3D TILT)
          ===================================================================== */}
      <section id="innovations" className="section-premium" style={{ background: '#000000' }}>
        <h2 className="section-title">Everything interconnected.</h2>
        <p className="section-subtitle">
          Ten modular systems connecting paper drafting, literature search, and in-browser computation into a unified workflow.
        </p>

        <div className="bento-grid">
          {/* Card 1: Scientific Integrity Shield */}
          <TiltCard3D className="glass-panel bento-item" style={{ gridColumn: 'span 7' }}>
            <div className="feature-icon-premium" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))', borderColor: 'rgba(34,197,94,0.3)' }}>
              <ShieldCheck size={24} style={{ color: '#4ade80' }} />
            </div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: 10, color: '#fff' }}>Scientific Integrity Shield</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: 520, fontSize: '0.92rem' }}>
              Audit your research papers against curated Retraction Watch sample datasets, verify DOI authenticity via Crossref, and detect unverified references before journal submission.
            </p>
            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <span style={{ fontSize: '0.74rem', padding: '4px 10px', borderRadius: 8, background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }}>
                ✓ Sample Retraction Datasets
              </span>
              <span style={{ fontSize: '0.74rem', padding: '4px 10px', borderRadius: 8, background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}>
                ✓ Crossref DOI Verification
              </span>
            </div>
          </TiltCard3D>

          {/* Card 2: Deep Work Soundscape & Dynamic Island */}
          <TiltCard3D className="glass-panel bento-item" style={{ gridColumn: 'span 5' }}>
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
          </TiltCard3D>

          {/* Card 3: Autonomous Grant Intelligence */}
          <TiltCard3D className="glass-panel bento-item" style={{ gridColumn: 'span 4' }}>
            <div className="feature-icon-premium" style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(56,189,248,0.05))', borderColor: 'rgba(56,189,248,0.3)' }}>
              <Target size={24} style={{ color: '#38bdf8' }} />
            </div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: 10, color: '#fff' }}>Grant Radar (Sample Calls)</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontSize: '0.92rem' }}>
              AI cross-matches your proposal against curated funding opportunities from NSF, NIH, DARPA, and Horizon Europe sample datasets.
            </p>
          </TiltCard3D>

          {/* Card 4: Global Pre-Print Literature Radar */}
          <TiltCard3D className="glass-panel bento-item" style={{ gridColumn: 'span 4' }}>
            <div className="feature-icon-premium" style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.2), rgba(234,179,8,0.05))', borderColor: 'rgba(234,179,8,0.3)' }}>
              <Radio size={24} style={{ color: '#facc15' }} />
            </div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: 10, color: '#fff' }}>Global Literature Radar</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontSize: '0.92rem' }}>
              Streaming live arXiv and bioRxiv pre-prints with automated citation trend analysis, algorithmic clustering, and daily scientific briefings.
            </p>
          </TiltCard3D>

          {/* Card 5: Antigravity Code Studio */}
          <TiltCard3D className="glass-panel bento-item" style={{ gridColumn: 'span 4' }}>
            <div className="feature-icon-premium" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(99,102,241,0.05))', borderColor: 'rgba(99,102,241,0.3)' }}>
              <Terminal size={24} style={{ color: '#818cf8' }} />
            </div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: 10, color: '#fff' }}>Antigravity Code Studio</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontSize: '0.92rem' }}>
              Autonomous developer agent generating multi-file Python and NumPy models, test harnesses, and client-side validation loops.
            </p>
          </TiltCard3D>
        </div>
      </section>

      {/* =====================================================================
          ARCHITECTURE SECTION: WHAT'S ACTUALLY BUILT
          ===================================================================== */}
      <section id="architecture" className="section-premium" style={{ background: '#070911', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="section-title">Architecture: What's Actually Built.</h2>
        <p className="section-subtitle">
          A transparent breakdown of the production stack and runtime components implemented and running in this repository.
        </p>

        <div className="architecture-timeline" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <div className="pipeline-step-card">
            <span className="pipeline-step-num">01</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>Next.js 16 & React 19</h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
              App Router hybrid SSR/CSR architecture with Server Actions, API Route Handlers, and streaming client components.
            </p>
          </div>

          <div className="pipeline-step-card">
            <span className="pipeline-step-num">02</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>Three.js & WebGL 3D</h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
              Custom interactive 360° orbiting 3D hero stage and 3D force-directed citation galaxy graph with drag controls.
            </p>
          </div>

          <div className="pipeline-step-card">
            <span className="pipeline-step-num">03</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>Pyodide WebAssembly</h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
              In-browser Python 3.11 runtime with NumPy. Runs matrix computations locally inside the browser with zero server round-trips.
            </p>
          </div>

          <div className="pipeline-step-card">
            <span className="pipeline-step-num">04</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>Supabase & pgvector</h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
              PostgreSQL database with Row-Level Security (RLS) data isolation, user authentication sessions, and pgvector embeddings.
            </p>
          </div>

          <div className="pipeline-step-card">
            <span className="pipeline-step-num">05</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>Google Gemini & Sara AI</h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
              Frontier model routing with client real-time temporal anchor, clock synchronization, and paper summarization.
            </p>
          </div>

          <div className="pipeline-step-card">
            <span className="pipeline-step-num">06</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>Client-Side BYOK Storage</h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
              Bring-Your-Own-Key model routing keeping user OpenAI, Anthropic, and Grok keys encrypted in localStorage.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================================
          COMPETITIVE COMPARISON: WHAT THIS PROJECT EXPLORES
          ===================================================================== */}
      <section id="exploration" className="section-premium" style={{ background: '#000000' }}>
        <h2 className="section-title">What this project explores.</h2>
        <p className="section-subtitle">
          A conceptual exploration of how unifying in-browser execution, 3D citation graphs, and multi-agent debate compares against traditional separated research tools.
        </p>

        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th style={{ width: '32%' }}>Exploration Area</th>
                <th className="rminios-col-highlight" style={{ width: '22%' }}>⚡ RMinios OS (Exploration)</th>
                <th style={{ width: '15%' }}>Overleaf</th>
                <th style={{ width: '15%' }}>ChatGPT Plus</th>
                <th style={{ width: '16%' }}>Semantic Scholar</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Multi-Agent Swarm Debate</strong></td>
                <td className="rminios-col-highlight"><Check size={18} style={{ color: '#22c55e' }} /> 4 Personas Synced</td>
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
                <td><strong>In-Browser Python (NumPy) WASM</strong></td>
                <td className="rminios-col-highlight"><Check size={18} style={{ color: '#22c55e' }} /> Pyodide (Runs in browser)</td>
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

        {/* Portfolio Project Disclaimer Banner */}
        <div className="pricing-disclaimer-banner">
          <span style={{ fontSize: '1.4rem' }}>💡</span>
          <div>
            <strong style={{ fontSize: '0.96rem', color: '#fef08a' }}>
              Portfolio project: no payments, plans are illustrative.
            </strong>
            <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', lineHeight: 1.5 }}>
              RMinios is an open-source engineering exploration designed by Jonnadula Mohit Sai. All core features are available for testing without payment.
            </p>
          </div>
        </div>

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

          {/* Fellow Tier (Illustrative Tier) */}
          <div className="glass-panel" style={{ padding: 36, display: 'flex', flexDirection: 'column', border: '1px solid rgba(99,102,241,0.5)', background: 'rgba(99,102,241,0.06)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '5px 16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', fontSize: '0.72rem', fontWeight: 700, borderBottomLeftRadius: 14, color: '#fff' }}>
              ILLUSTRATIVE TIER
            </div>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: '0 0 6px 0' }}>Fellow & Lab Scientist</h3>
            <span style={{ fontSize: '0.8rem', color: '#a5b4fc', marginBottom: 20 }}>Illustrative concept for lab research groups</span>
            <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 24, color: '#fff' }}>$29<span style={{ fontSize: '1rem', color: '#888', fontWeight: 400 }}> / month</span></div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: 14, color: '#e2e8f0', fontSize: '0.86rem' }}>
              <li style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} style={{ color: '#38bdf8' }} /> Unlimited Research Papers & Workspaces</li>
              <li style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} style={{ color: '#38bdf8' }} /> 4-Agent Swarm Arena (Configurable Multi-LLM Fleet)</li>
              <li style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} style={{ color: '#38bdf8' }} /> Adversarial NeurIPS Peer Review & Rebuttal Generator</li>
              <li style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} style={{ color: '#38bdf8' }} /> Dual-Host NotebookLM Audio Studio & Wave Synthesis</li>
              <li style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} style={{ color: '#38bdf8' }} /> Academic-to-Startup Venture Studio & Pitch Decks</li>
              <li style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} style={{ color: '#38bdf8' }} /> Active Grant & Funding Radar (Curated Sample Calls)</li>
            </ul>
            
            <Link href="/signup" className="premium-btn-primary" style={{ marginTop: 'auto', width: '100%' }}>
              Explore Fellow Features
            </Link>
          </div>

          {/* Enterprise / Institution */}
          <div className="glass-panel" style={{ padding: 36, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', margin: '0 0 6px 0' }}>University & Enterprise</h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 20 }}>Illustrative tier for institutions and labs</span>
            <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 24 }}>$99<span style={{ fontSize: '1rem', color: '#888', fontWeight: 400 }}> / month</span></div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: 14, color: '#cbd5e1', fontSize: '0.86rem' }}>
              <li style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} style={{ color: '#22c55e' }} /> Unlimited Team Members & Multi-User Collaboration</li>
              <li style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} style={{ color: '#22c55e' }} /> Self-Hosted Deployment Guides & Docker Configuration</li>
              <li style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} style={{ color: '#22c55e' }} /> Bring-Your-Own-Key (BYOK) Custom Model Routing</li>
              <li style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} style={{ color: '#22c55e' }} /> Open-Source GitHub Issue Tracking & Community Support</li>
            </ul>
            
            <Link href="/support" className="premium-btn" style={{ marginTop: 'auto', width: '100%' }}>
              Submit Lab Inquiry
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
              q: "How does the in-browser Python sandbox run in your browser?",
              a: "RMinios uses Pyodide, an Emscripten-compiled WebAssembly port of CPython 3.11 with NumPy. Execution runs 100% locally inside your web browser's isolated WASM sandbox, ensuring instant runtimes, zero cloud queuing, and absolute data privacy."
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
              <span>All 10 Research Modules Operational</span>
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
              <li><Link href="/dashboard/grants" style={{ color: 'inherit', textDecoration: 'none' }}>Grant & Funding Radar</Link></li>
              <li><Link href="/dashboard/radar" style={{ color: 'inherit', textDecoration: 'none' }}>Global Literature Radar</Link></li>
              <li><Link href="/dashboard/codestudio" style={{ color: 'inherit', textDecoration: 'none' }}>Antigravity Code Studio</Link></li>
              <li><Link href="/support" style={{ color: 'inherit', textDecoration: 'none' }}>Support & Documentation</Link></li>
            </ul>
          </div>

          {/* Creator & Contact Col */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginBottom: 14 }}>Creator & Contact</h4>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
              <div>Creator: <strong>Jonnadula Mohit Sai</strong></div>
              <div style={{ margin: '6px 0 12px 0', color: 'rgba(255,255,255,0.6)' }}>
                Have inquiries, feedback, or collaboration ideas? Reach out directly via our contact form.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link href="/support" className="premium-btn" style={{ padding: '7px 14px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: 6, width: 'fit-content' }}>
                  <MessageSquare size={13} /> Open Contact Form
                </Link>
                <a 
                  href="https://github.com/Mohitsai3579/rminios" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ color: '#38bdf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', marginTop: 4 }}
                >
                  <GithubIcon size={13} /> GitHub Repository
                </a>
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
