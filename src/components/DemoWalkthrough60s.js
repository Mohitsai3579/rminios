'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Compass, Code, Cpu, 
  ShieldCheck, Rocket, FileText, ArrowRight, CheckCircle2,
  Sparkles, Layers
} from 'lucide-react';

const DEMO_STEPS = [
  {
    id: 1,
    timeRange: '0:00 - 0:12',
    duration: 12,
    title: 'arXiv Ingestion & Semantic Parsing',
    badge: '01 / 05 • Ingestion',
    icon: FileText,
    accentColor: '#6366f1',
    description: 'Ingest raw arXiv pre-prints, extract mathematical lemmas, and generate vector embeddings with zero cloud lock-in.',
    details: [
      'Automatic DOI resolution and Crossref metadata extraction',
      'Chunked semantic indexing using Supabase pgvector',
      'Instant extraction of theorem statements and experimental tables'
    ],
    previewCode: `>> Ingesting arXiv:2403.09629 [cs.LG]
>> Title: "Sub-Quadratic Attention via State-Space Routing"
>> Vector Embeddings: 1,536-dim semantic chunks created
>> Status: 100% Parsed into Persistent Workspace`
  },
  {
    id: 2,
    timeRange: '0:13 - 0:24',
    duration: 12,
    title: '3D Citation Constellation & Gap Radar',
    badge: '02 / 05 • 3D Discovery',
    icon: Compass,
    accentColor: '#38bdf8',
    description: 'Navigate literature in an interactive 3D WebGL galaxy to detect interdisciplinary gaps and unbridged scientific white spaces.',
    details: [
      'Interactive 360° orbital WebGL force-directed graph',
      'Automated cluster analysis connecting disparate papers',
      'Example Concept Output: Sub-quadratic cross-attention gap'
    ],
    previewCode: `[3D GRAPH TELEMETRY]
>> Active Graph: 12 Landmark Nodes • 38 Directed Edges
>> Gap Detected: Vaswani (2017) <---> Gu & Dao (2023)
>> Synthesis Target: Sparse state routing with O(1) inference
>> Example Output: Discovery Potential 98.4%`
  },
  {
    id: 3,
    timeRange: '0:25 - 0:36',
    duration: 12,
    title: 'In-Browser Python (NumPy) Execution',
    badge: '03 / 05 • Client WASM',
    icon: Code,
    accentColor: '#22c55e',
    description: 'Test hypotheses instantly. Run Python 3.11 with NumPy directly inside your browser via Pyodide WebAssembly with zero server dependencies.',
    details: [
      '100% client-side computation in isolated WebAssembly',
      'Vectorized NumPy matrix multiplications (Q, K, V attention)',
      'Zero server round-trips; complete data privacy on your machine'
    ],
    previewCode: `>> Pyodide 0.26 WebAssembly Runtime Initialized
>> Executing compute_attention(Q, K, V) in browser sandbox...
>> Input Dimensions: (batch=1, heads=8, seq=512, dim=64)
>> Memory Footprint: Client Browser VRAM
>> Empirical Match Score: 100% [VALIDATED]`
  },
  {
    id: 4,
    timeRange: '0:37 - 0:48',
    duration: 12,
    title: 'Multi-Agent Swarm Arena Consensus',
    badge: '04 / 05 • Multi-LLM Fleet',
    icon: Cpu,
    accentColor: '#f59e0b',
    description: 'Four configurable frontier models debate the core hypothesis across theoretical soundness, edge cases, and mathematical formalization.',
    details: [
      'Anthropic Claude role: Theoretical Hypothesizer',
      'xAI Grok role: Adversarial Stress-Tester',
      'OpenAI GPT role: Mathematical Formalizer',
      'Google Gemini role: Meta-Consensus Chair'
    ],
    previewCode: `[SWARM ROUND 3: CONSENSUS ACHIEVED]
Claude: "Propose block-diagonal decay across context window."
Grok: "Stress-tested condition number κ <= 1.48 under float16."
GPT: "Formulated Theorem 2 proof and pre-softmax clamp."
Gemini: "Consensus reached. Ready for peer review."`
  },
  {
    id: 5,
    timeRange: '0:49 - 1:00',
    duration: 12,
    title: 'Adversarial Peer Review & Venture Pitch',
    badge: '05 / 05 • Publication & Venture',
    icon: Rocket,
    accentColor: '#ec4899',
    description: 'Simulate NeurIPS review panels to spot rejection risks, then auto-generate a 10-slide VC pitch deck to spin out a deep-tech startup.',
    details: [
      '3-reviewer committee with acceptance scoring & rebuttal drafts',
      'Retraction Watch sample dataset audit & DOI verification',
      'TAM/SAM/SOM market sizing & 10-slide seed pitch deck generator'
    ],
    previewCode: `[EVALUATION VERDICT: ACCEPT (Oral Presentation)]
Reviewer 1 (Theory): 8/10 • Lemma 3 proof verified
Reviewer 2 (Systems): 7/10 • Strong throughput gains
Reviewer 3 (Integrity): 9/10 • Zero retracted citations
Venture Output: 10-Slide Pitch Deck generated for LinearBio Inc.`
  }
];

export default function DemoWalkthrough60s() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef(null);

  const activeStep = DEMO_STEPS[activeStepIndex];

  // Timer loop for 60 seconds
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed(prev => {
          if (prev >= 59) {
            setIsPlaying(false);
            return 0;
          }
          const nextSec = prev + 1;
          // Calculate step index (each step is 12 seconds)
          const newStepIdx = Math.min(Math.floor(nextSec / 12), DEMO_STEPS.length - 1);
          setActiveStepIndex(newStepIdx);
          return nextSec;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const handleStepClick = (index) => {
    setActiveStepIndex(index);
    setSecondsElapsed(index * 12);
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setSecondsElapsed(0);
    setActiveStepIndex(0);
  };

  const progressPercent = ((secondsElapsed + 1) / 60) * 100;
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: 1100,
      margin: '36px auto 16px',
      background: 'rgba(12, 15, 26, 0.75)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: 24,
      overflow: 'hidden',
      boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.15)'
    }}>
      {/* Top Header Bar */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 14px rgba(99, 102, 241, 0.5)'
          }}>
            <Sparkles size={16} style={{ color: '#fff' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                60-Second Interactive Platform Walkthrough
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 12,
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#4ade80',
                border: '1px solid rgba(34, 197, 94, 0.3)'
              }}>
                Interactive Demo
              </span>
            </div>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              Watch how RMinios connects paper reading to WebAssembly computing and peer review in 1 minute
            </span>
          </div>
        </div>

        {/* Player Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontFamily: 'monospace',
            fontSize: '0.82rem',
            color: '#cbd5e1',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '5px 10px',
            borderRadius: 8,
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            {formatTime(secondsElapsed)} / 1:00
          </span>
          <button
            onClick={handleTogglePlay}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: isPlaying ? 'rgba(239, 68, 68, 0.2)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: isPlaying ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(99, 102, 241, 0.4)',
              color: '#fff',
              padding: '6px 14px',
              borderRadius: 10,
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            {isPlaying ? 'Pause Demo' : 'Play Walkthrough'}
          </button>
          <button
            onClick={handleReset}
            title="Restart Walkthrough"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              padding: '6px 8px',
              borderRadius: 10,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Scrubber Progress Bar */}
      <div style={{
        width: '100%',
        height: 4,
        background: 'rgba(255, 255, 255, 0.08)',
        position: 'relative'
      }}>
        <div style={{
          width: `${progressPercent}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #6366f1, #38bdf8, #22c55e, #f59e0b, #ec4899)',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Interactive Step Navigator Pills */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 8,
        padding: '12px 18px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        background: 'rgba(0, 0, 0, 0.2)'
      }}>
        {DEMO_STEPS.map((step, idx) => {
          const StepIcon = step.icon;
          const isActive = idx === activeStepIndex;
          return (
            <button
              key={step.id}
              onClick={() => handleStepClick(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 10,
                background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                border: isActive ? `1px solid ${step.accentColor}55` : '1px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                width: 24,
                height: 24,
                borderRadius: 7,
                background: isActive ? step.accentColor : 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive ? '#fff' : '#94a3b8',
                flexShrink: 0
              }}>
                <StepIcon size={13} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isActive ? '#fff' : '#94a3b8', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {step.title.split(' ')[0]} {step.title.split(' ')[1]}
                </div>
                <div style={{ fontSize: '0.66rem', color: isActive ? step.accentColor : '#64748b' }}>
                  {step.timeRange}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Walkthrough Viewport */}
      <div style={{
        padding: '24px 28px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 24,
        alignItems: 'center'
      }}>
        {/* Left Column: Stage Narrative */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 12,
              background: `${activeStep.accentColor}22`,
              color: activeStep.accentColor,
              border: `1px solid ${activeStep.accentColor}44`
            }}>
              {activeStep.badge}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
              Segment {activeStep.timeRange}
            </span>
          </div>

          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.3 }}>
            {activeStep.title}
          </h3>

          <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
            {activeStep.description}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {activeStep.details.map((item, dIdx) => (
              <div key={dIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.8rem', color: '#94a3b8' }}>
                <CheckCircle2 size={15} style={{ color: activeStep.accentColor, flexShrink: 0, marginTop: 2 }} />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
            <a
              href="#engines"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Test Live in Playground <ArrowRight size={14} />
            </a>
          </div>
        </div>

        {/* Right Column: Code & Telemetry Window */}
        <div style={{
          background: '#070913',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.1)'
        }}>
          {/* Terminal Title Bar */}
          <div style={{
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#eab308' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>
              rminios://engine-stream/{activeStep.id}
            </span>
          </div>

          {/* Terminal Body */}
          <div style={{
            padding: '16px 18px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '0.78rem',
            lineHeight: 1.6,
            color: '#e2e8f0',
            whiteSpace: 'pre-wrap',
            minHeight: 170
          }}>
            {activeStep.previewCode}
          </div>
        </div>
      </div>
    </div>
  );
}
