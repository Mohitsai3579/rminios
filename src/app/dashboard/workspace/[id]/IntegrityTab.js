'use client';
import { useState } from 'react';
import { Loader, Sparkles, AlertTriangle, CheckCircle, BookOpen, Type } from 'lucide-react';

export default function IntegrityTab({ workspaceId }) {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  async function analyze() {
    if (!text.trim()) return;
    setAnalyzing(true);
    try {
      const res = await fetch('/api/integrity/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, workspaceId }) });
      if (res.ok) setAnalysis(await res.json());
    } catch (err) { console.error(err); }
    setAnalyzing(false);
  }

  const scoreColor = (s) => s >= 70 ? 'var(--green)' : s >= 40 ? 'var(--amber)' : 'var(--rose)';

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 4 }}>Research Integrity Center</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Analyze writing quality, similarity, citations, and academic tone</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: analysis ? '1fr 400px' : '1fr', gap: 24 }}>
        <div>
          <textarea className="input w-full" value={text} onChange={e => setText(e.target.value)} placeholder="Paste your paper text here for analysis..." rows={20} style={{ minHeight: 400 }} />
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={analyze} disabled={analyzing || !text.trim()}>
            {analyzing ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</> : <><Sparkles size={16} /> Analyze Paper</>}
          </button>
        </div>

        {analysis && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Overall Score */}
            <div className="card" style={{ textAlign: 'center' }}>
              <div className="score-ring" style={{ margin: '0 auto 12px', color: scoreColor(analysis.overall_score || 0), border: `4px solid ${scoreColor(analysis.overall_score || 0)}`, borderRadius: '50%' }}>
                {analysis.overall_score || 0}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Overall Quality Score</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>out of 100</div>
            </div>

            {/* Metrics */}
            {[
              { label: 'Writing Clarity', key: 'clarity_score', icon: <Type size={14} /> },
              { label: 'Academic Tone', key: 'tone_score', icon: <BookOpen size={14} /> },
              { label: 'Citation Quality', key: 'citation_score', icon: <CheckCircle size={14} /> },
              { label: 'Originality', key: 'originality_score', icon: <Sparkles size={14} /> },
            ].map(m => (
              <div key={m.key} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>{m.icon} {m.label}</span>
                  <span style={{ fontWeight: 600, color: scoreColor(analysis[m.key] || 0) }}>{analysis[m.key] || 0}/100</span>
                </div>
                <div className="metric-bar"><div className="metric-fill" style={{ width: `${analysis[m.key] || 0}%`, background: scoreColor(analysis[m.key] || 0) }} /></div>
              </div>
            ))}

            {/* Issues */}
            {analysis.issues?.length > 0 && (
              <div className="card">
                <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={16} style={{ color: 'var(--amber)' }} /> Issues Found ({analysis.issues.length})</h4>
                {analysis.issues.map((issue, i) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.82rem' }}>
                    <span className={`badge ${issue.severity === 'high' ? 'badge-rose' : issue.severity === 'medium' ? 'badge-amber' : 'badge-primary'}`} style={{ marginRight: 8 }}>{issue.severity}</span>
                    {issue.message}
                  </div>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {analysis.suggestions?.length > 0 && (
              <div className="card">
                <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle size={16} style={{ color: 'var(--green)' }} /> Suggestions</h4>
                {analysis.suggestions.map((s, i) => <div key={i} style={{ padding: '6px 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>✓ {s}</div>)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
