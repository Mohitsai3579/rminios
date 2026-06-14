'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Brain, FileText, UploadCloud, Target, BookOpen, Code, Beaker, ArrowRight, ShieldCheck, Rocket, Zap, BarChart, Database, Lock, Terminal, Activity, CheckCircle, Star } from 'lucide-react';
import './landing.css';
import SaraAssistant from '@/components/SaraAssistant';

// Lazy load heavy 3D component
const HeroScene = dynamic(() => import('@/components/HeroScene'), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
});

const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
};

function MagnetButton({ children, className, ...props }) {
  const ref = useRef(null);
  
  const handleMouseMove = (e) => {
    if(!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.2;
    const y = (clientY - (top + height / 2)) * 0.2;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  };

  const handleMouseLeave = () => {
    if(!ref.current) return;
    ref.current.style.transform = `translate(0px, 0px)`;
  };

  return (
    <div 
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ transition: 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)' }}
      {...props}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  // Dynamic Site Settings
  const [siteSettings, setSiteSettings] = useState({
    owner_name: 'Mohit Jonnadula',
    support_email: 'mohitjonnadula16@gmail.com',
    support_phone: '9494366318'
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if(data && !data.error) setSiteSettings(data);
      })
      .catch(console.error);
  }, []);

  // Global mouse tracking for bento glow effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      for(const card of document.querySelectorAll(".bento-item")) {
        const rect = card.getBoundingClientRect(),
              x = e.clientX - rect.left,
              y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      }
    };
    document.body.addEventListener("mousemove", handleMouseMove);
    return () => document.body.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="landing-container" data-theme="midnight" style={{ backgroundColor: '#000', color: '#fff' }}>
      <style dangerouslySetInnerHTML={{__html: `
        body, html {
          background-color: #000 !important;
          color: #fff !important;
        }
      `}} />
      {/* Dynamic 3D Hero Background */}
      <HeroScene />

      {/* Navigation */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Brain size={28} style={{ color: '#fff' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>RMinios</h2>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href="/login" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='#fff'} onMouseOut={e => e.target.style.color='rgba(255,255,255,0.7)'}>Sign In</Link>
          <MagnetButton>
            <Link href="/signup" className="premium-btn">Get Early Access</Link>
          </MagnetButton>
        </div>
      </nav>

      {/* Hero Content */}
      <motion.section 
        className="hero-section"
        style={{ y: yHero, opacity: opacityHero }}
      >
        <div className="hero-bg-glow" />
        <motion.div 
          initial="hidden"
          animate="show"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.15 } },
          }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}
        >
          <motion.div variants={FADE_UP_ANIMATION_VARIANTS} style={{ marginBottom: 24, padding: '8px 20px', borderRadius: 30, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }} />
            RMinios OS 2.0 is now live
          </motion.div>
          
          <motion.h1 variants={FADE_UP_ANIMATION_VARIANTS} className="hero-title">
            The intelligent layer for <br/><span className="text-gradient-premium">modern research.</span>
          </motion.h1>
          
          <motion.p variants={FADE_UP_ANIMATION_VARIANTS} className="hero-subtitle">
            An operating system designed to orchestrate knowledge, execute data pipelines, and draft publications at the speed of thought.
          </motion.p>
          
          <motion.div variants={FADE_UP_ANIMATION_VARIANTS} style={{ display: 'flex', gap: 16 }}>
            <MagnetButton>
              <Link href="/signup" className="premium-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Start Building <ArrowRight size={18} />
              </Link>
            </MagnetButton>
            <MagnetButton>
              <button className="premium-btn" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Terminal size={18} /> Read the Docs
              </button>
            </MagnetButton>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* AI Assistant Terminal Simulation */}
      <section className="section-premium" style={{ background: 'linear-gradient(to bottom, transparent, rgba(10,11,15,1))', position: 'relative', zIndex: 20 }}>
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ maxWidth: 900, margin: '0 auto' }}
        >
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }}/>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#eab308' }}/>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }}/>
              <span style={{ marginLeft: 12, fontSize: '0.8rem', color: '#888', fontFamily: 'monospace' }}>sara-orchestrator-v2</span>
            </div>
            <div style={{ padding: 40, fontFamily: 'monospace', fontSize: '0.9rem', color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: '#6366f1' }}>user$</span> 
                <span style={{ color: '#fff' }}>Analyze "Attention is All You Need" and find gaps in cross-attention scaling.</span>
              </motion.div>
              <motion.div initial={{ opacity: 0, height: 0 }} whileInView={{ opacity: 1, height: 'auto' }} transition={{ delay: 1, duration: 0.5 }} style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: '#22c55e' }}>sara$</span> 
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span>Initializing vector search across 42M semantic chunks... <span style={{ color: '#22c55e' }}>[OK]</span></span>
                  <span>Synthesizing cross-attention limitations... <span style={{ color: '#22c55e' }}>[OK]</span></span>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: 16, borderRadius: 8, color: '#e2e8f0', marginTop: 8 }}>
                    <strong>Gap Discovered:</strong> While cross-attention mechanisms efficiently align multimodal streams, quadratic scaling with sequence length limits context window processing for high-res medical imagery. Proposed solution generated: <span style={{ color: '#38bdf8', textDecoration: 'underline', cursor: 'pointer' }}>Linear_Medical_Cross_Attention.pdf</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Bento Box Features */}
      <section className="section-premium" style={{ background: '#000', position: 'relative', zIndex: 20 }}>
        <h2 className="section-title">Everything interconnected.</h2>
        <p className="section-subtitle">A unified platform where data ingestion, vector search, and document generation flow seamlessly together.</p>
        
        <div className="bento-grid">
          {/* Card 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2, zIndex: 30 }} transition={{ duration: 0.5 }} viewport={{ once: true }}
            className="glass-panel bento-item" style={{ gridColumn: 'span 8', padding: 40, transformStyle: 'preserve-3d', perspective: 1000 }}
          >
            <div className="feature-icon-premium"><Database size={24} /></div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 12 }}>Multimodal Knowledge Base</h3>
            <p style={{ color: '#888', lineHeight: 1.6, maxWidth: 400 }}>Drop PDFs, Word Docs, datasets, or link Google Drive. We instantly chunk, embed, and index your entire corpus using hybrid search.</p>
            
            {/* Visual graphic */}
            <div style={{ marginTop: 40, height: 200, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 40, right: 40, height: 120, background: 'linear-gradient(to top, rgba(99,102,241,0.2), transparent)', borderTopLeftRadius: 8, borderTopRightRadius: 8, border: '1px solid rgba(99,102,241,0.3)', borderBottom: 'none' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 80, right: 80, height: 80, background: 'linear-gradient(to top, rgba(45,212,191,0.2), transparent)', borderTopLeftRadius: 8, borderTopRightRadius: 8, border: '1px solid rgba(45,212,191,0.3)', borderBottom: 'none' }} />
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02, rotateX: 2, rotateY: 2, zIndex: 30 }} transition={{ duration: 0.5, delay: 0.1 }} viewport={{ once: true }}
            className="glass-panel bento-item" style={{ gridColumn: 'span 4', padding: 40, transformStyle: 'preserve-3d', perspective: 1000 }}
          >
            <div className="feature-icon-premium"><Activity size={24} /></div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 12 }}>RAG Chat</h3>
            <p style={{ color: '#888', lineHeight: 1.6 }}>Chat directly with your data. Every claim is strictly backed by inline citations from your uploaded papers, eliminating hallucinations.</p>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02, rotateX: -2, rotateY: -2, zIndex: 30 }} transition={{ duration: 0.5, delay: 0.2 }} viewport={{ once: true }}
            className="glass-panel bento-item" style={{ gridColumn: 'span 4', padding: 40, transformStyle: 'preserve-3d', perspective: 1000 }}
          >
            <div className="feature-icon-premium"><FileText size={24} /></div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 12 }}>Editor Co-Pilot</h3>
            <p style={{ color: '#888', lineHeight: 1.6 }}>Write papers section by section. The AI analyzes your knowledge base to draft content, format citations, and humanize tone.</p>
          </motion.div>

          {/* Card 4 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02, rotateX: -2, rotateY: 2, zIndex: 30 }} transition={{ duration: 0.5, delay: 0.3 }} viewport={{ once: true }}
            className="glass-panel bento-item" style={{ gridColumn: 'span 8', padding: 40, transformStyle: 'preserve-3d', perspective: 1000 }}
          >
            <div className="feature-icon-premium"><Target size={24} /></div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 12 }}>Gap Discovery & Orchestration</h3>
            <p style={{ color: '#888', lineHeight: 1.6, maxWidth: 400 }}>Let the AI analyze 1000s of literature reviews to find unsolved problems. Then, generate project architectures, roadmaps, and initial setups instantly.</p>
          </motion.div>
        </div>
      </section>

      {/* Architecture Flow */}
      <section className="section-premium" style={{ background: '#0a0a0a', position: 'relative', zIndex: 20, overflow: 'hidden' }}>
        <h2 className="section-title">Engineered for Scale</h2>
        <p className="section-subtitle">A robust microservices architecture handling massive vector embeddings and LLM routing with sub-second latency.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, marginTop: 60 }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="flow-node">
            <UploadCloud size={24} style={{ color: '#38bdf8' }} /> Document Ingestion Pipeline
          </motion.div>
          <div className="flow-connector" style={{ width: 2, height: 40 }} />
          <div style={{ display: 'flex', gap: 40 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flow-node">
                <Database size={24} style={{ color: '#a855f7' }} /> Vector Splitting & Chunks
              </motion.div>
              <div className="flow-connector" style={{ width: 2, height: 40 }} />
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="flow-node">
                <ShieldCheck size={24} style={{ color: '#22c55e' }} /> Pinecone / Supabase pgvector
              </motion.div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flow-node">
                <Brain size={24} style={{ color: '#f43f5e' }} /> Embedding Models (Voyage/OpenAI)
              </motion.div>
              <div className="flow-connector" style={{ width: 2, height: 40 }} />
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="flow-node">
                <Zap size={24} style={{ color: '#eab308' }} /> LLM Orchestration Layer
              </motion.div>
            </div>
          </div>
          <div className="flow-connector" style={{ width: 2, height: 40 }} />
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="flow-node" style={{ background: 'rgba(99,102,241,0.2)', borderColor: 'rgba(99,102,241,0.5)' }}>
            <Terminal size={24} style={{ color: '#fff' }} /> Client Application (Canvas & Editor)
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section-premium" style={{ background: '#000', position: 'relative', zIndex: 20 }}>
        <h2 className="section-title">Predictable pricing. Infinite power.</h2>
        <p className="section-subtitle">Start for free, upgrade when your research demands enterprise scale.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, maxWidth: 1000, margin: '0 auto' }}>
          {/* Pro Tier */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-panel" style={{ padding: 40, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 500, color: '#888', marginBottom: 8 }}>Hobbyist</h3>
            <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 24 }}>$0<span style={{ fontSize: '1rem', color: '#888', fontWeight: 400 }}>/mo</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: 16, color: '#a1a1aa' }}>
              <li style={{ display: 'flex', gap: 12 }}><CheckCircle size={20} style={{ color: '#22c55e' }}/> Up to 10 Papers</li>
              <li style={{ display: 'flex', gap: 12 }}><CheckCircle size={20} style={{ color: '#22c55e' }}/> Basic RAG Chat</li>
              <li style={{ display: 'flex', gap: 12 }}><CheckCircle size={20} style={{ color: '#22c55e' }}/> Standard Canvas</li>
            </ul>
            <button className="premium-btn" style={{ marginTop: 'auto', width: '100%' }}>Start Free</button>
          </motion.div>

          {/* Enterprise Tier */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="glass-panel" style={{ padding: 40, display: 'flex', flexDirection: 'column', border: '1px solid rgba(99,102,241,0.5)', background: 'rgba(99,102,241,0.05)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '6px 16px', background: '#6366f1', fontSize: '0.75rem', fontWeight: 600, borderBottomLeftRadius: 16 }}>MOST POPULAR</div>
            <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: 200, height: 200, background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)', filter: 'blur(30px)', zIndex: 0 }}/>
            
            <div style={{ zIndex: 10 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 500, color: '#fff', marginBottom: 8 }}>Researcher Pro</h3>
              <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 24 }}>$29<span style={{ fontSize: '1rem', color: '#888', fontWeight: 400 }}>/mo</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: 16, color: '#e2e8f0' }}>
                <li style={{ display: 'flex', gap: 12 }}><CheckCircle size={20} style={{ color: '#38bdf8' }}/> Unlimited Papers & Vectors</li>
                <li style={{ display: 'flex', gap: 12 }}><CheckCircle size={20} style={{ color: '#38bdf8' }}/> Advanced AI Co-Pilot</li>
                <li style={{ display: 'flex', gap: 12 }}><CheckCircle size={20} style={{ color: '#38bdf8' }}/> 3D Canvas & Media Integrations</li>
                <li style={{ display: 'flex', gap: 12 }}><CheckCircle size={20} style={{ color: '#38bdf8' }}/> Live ArXiv/Semantic Search</li>
              </ul>
            </div>
            <button className="premium-btn-primary" style={{ marginTop: 'auto', width: '100%', zIndex: 10 }}>Upgrade to Pro</button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 40px', borderTop: '1px solid rgba(255,255,255,0.05)', background: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, zIndex: 20, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Brain size={24} style={{ color: '#6366f1' }} />
          <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>RMinios</span>
        </div>
        <p style={{ color: '#666', fontSize: '0.9rem', textAlign: 'center', lineHeight: 1.8 }}>
          © 2026 RMinios OS. Built for the future of research.<br/>
          Owner & Creator: {siteSettings.owner_name}<br/>
          Support: <a href={`mailto:${siteSettings.support_email}`} style={{ color: '#38bdf8', textDecoration: 'none' }}>{siteSettings.support_email}</a> | {siteSettings.support_phone}<br/>
          <Link href="/support" style={{ color: '#888', textDecoration: 'underline', marginTop: 8, display: 'inline-block' }}>Visit Support Center</Link>
        </p>
      </footer>
    </div>
  );
}
