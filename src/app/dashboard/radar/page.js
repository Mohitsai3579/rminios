'use client';

import { useState, useEffect } from 'react';
import { Radio, Search, ExternalLink, Bot, BookOpen, Sparkles, ArrowRight, FileText, Download } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const TOPIC_PRESETS = [
  'Multi-Agent LLM Orchestration',
  'Vision Transformers Medical Histopathology',
  'Graph Neural Networks Drug Discovery',
  'Quantum Neural Networks Error Correction',
  'Diffusion Models Time Series Anomaly'
];

export default function RadarPage() {
  const [query, setQuery] = useState('Multi-Agent LLM Orchestration');
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (searchTerm = query) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search/arxiv?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      setPapers(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch('Multi-Agent LLM Orchestration');
  }, []);

  const handleDeploySwarmOnPaper = (paper) => {
    // Navigate to Swarm tab with preloaded topic
    router.push(`/dashboard/swarm`);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* Banner */}
      <div 
        style={{ 
          background: 'radial-gradient(ellipse at top, rgba(245, 158, 11, 0.15), transparent 70%), var(--bg-secondary)', 
          border: '1px solid rgba(245, 158, 11, 0.3)', 
          borderRadius: 16, 
          padding: 24,
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ background: 'linear-gradient(135deg, #f59e0b, #e11d48)', padding: '5px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Radio size={13} /> GLOBAL LITERATURE RADAR
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Real-Time ArXiv Pre-print Intelligence & Citation Trend Analysis
          </span>
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          Global Scientific Literature Radar
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 6, maxWidth: 820 }}>
          Stream real-time academic research directly from the Cornell ArXiv XML network. Surface emerging pre-prints, inspect author contributions, and deploy autonomous AI agents on paper gaps in one click.
        </p>

        {/* Topic Pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 18 }}>
          {TOPIC_PRESETS.map((t, idx) => (
            <button
              key={idx}
              onClick={() => { setQuery(t); handleSearch(t); }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '6px 12px', background: query === t ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.04)', borderColor: query === t ? 'var(--amber)' : 'rgba(255,255,255,0.08)', color: query === t ? 'var(--amber)' : 'inherit' }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} style={{ display: 'flex', gap: 12 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Cornell ArXiv preprints (e.g. Transformers, Graph Neural Networks, Oncology)..."
            style={{ width: '100%', paddingLeft: 46, height: 46, fontSize: '0.9rem' }}
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ padding: '0 24px', fontWeight: 700 }} disabled={loading}>
          {loading ? 'Streaming...' : 'Scan Radar'}
        </button>
      </form>

      {/* Paper Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {papers.map((p, idx) => (
          <div 
            key={idx} 
            className="card card-3d"
            style={{ padding: 22, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--amber)', background: 'rgba(245, 158, 11, 0.12)', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                  {p.source} • {p.year}
                </span>
                <h3 style={{ margin: '8px 0 4px', fontSize: '1.05rem', color: '#fff', fontWeight: 700 }}>
                  {p.title}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Authors: {p.authors}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {p.pdfLink && (
                  <a href={p.pdfLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem' }}>
                    <ExternalLink size={13} /> PDF
                  </a>
                )}
                <button onClick={() => handleDeploySwarmOnPaper(p)} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem' }}>
                  <Bot size={13} /> Analyze in Swarm
                </button>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {p.summary}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
