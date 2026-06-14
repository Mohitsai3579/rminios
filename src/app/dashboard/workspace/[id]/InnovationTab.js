'use client';
import { useState } from 'react';
import { Loader, Sparkles, Lightbulb, Search, Target, DollarSign } from 'lucide-react';

export default function InnovationTab({ workspaceId }) {
  const [loading, setLoading] = useState(false);
  const [innovationData, setInnovationData] = useState(null);
  const [error, setError] = useState('');

  async function analyze() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/innovation/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId }) });
      if (res.ok) {
        const data = await res.json();
        setInnovationData(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || 'Analysis failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h3 style={{ marginBottom: 4 }}>Patent & Innovation Engine</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Discover commercialization opportunities from your research</p>
        </div>
        <button className="btn btn-primary" onClick={analyze} disabled={loading}>
          {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</> : <><Sparkles size={16} /> Run Innovation Analysis</>}
        </button>
      </div>

      {error && (
        <div className="card" style={{ padding: 16, marginBottom: 16, borderColor: 'var(--rose)', background: 'rgba(244,63,94,0.08)' }}>
          <p style={{ color: 'var(--rose)', fontSize: '0.85rem' }}>⚠️ {error}</p>
        </div>
      )}

      {!innovationData && !loading && !error && (
        <div className="empty-state">
          <div className="empty-state-icon">💡</div>
          <h3>Uncover Startup Opportunities</h3>
          <p>We'll analyze your workspace papers and notes to find patentable ideas, commercialization paths, and startup opportunities.</p>
        </div>
      )}

      {loading && !innovationData && (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <div className="spinner spinner-lg" style={{ margin: '0 auto 20px' }} />
          <div style={{ color: 'var(--text-secondary)' }}>Analyzing research context for market opportunities...</div>
        </div>
      )}

      {innovationData && (
        <div style={{ display: 'grid', gap: 24 }}>
          {/* Market Potential Overview */}
          <div className="card" style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="score-ring" style={{ color: 'var(--amber)', border: '4px solid var(--amber)' }}>{innovationData.market_score || 0}</div>
            <div style={{ flex: 1, minWidth: 250 }}>
              <h3 style={{ marginBottom: 8 }}>Commercialization Potential</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{innovationData.summary}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {/* Patents */}
            <div className="card">
              <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Search size={18} style={{ color: 'var(--teal)' }} /> Patent Landscape</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>{innovationData.patent_landscape}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {innovationData.potential_patents?.map((p, i) => (
                  <div key={i} style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>{p.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Startups */}
            <div className="card">
              <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Target size={18} style={{ color: 'var(--rose)' }} /> Startup Opportunities</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {innovationData.startup_ideas?.map((s, i) => (
                  <div key={i} style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.name}</div>
                      <span className="badge badge-primary">{s.business_model}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{s.pitch}</p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}><strong>Target Audience:</strong> {s.target_audience}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Funding */}
            <div className="card">
              <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><DollarSign size={18} style={{ color: 'var(--green)' }} /> Grant & Funding Paths</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {innovationData.funding_opportunities?.map((f, i) => (
                  <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.source}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{f.strategy}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
