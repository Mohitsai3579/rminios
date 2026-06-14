'use client';

import { useState, useEffect } from 'react';
import { Users, FolderOpen, FileText, Database, Activity, HardDrive, Brain, MessageSquare } from 'lucide-react';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  if (loading) return <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><div className="spinner spinner-lg" /></div>;

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <div className="topbar">
        <div>
          <h3>Admin Overview</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>System-wide metrics and health</p>
        </div>
      </div>

      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-light)' }}><Users size={24} /></div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{stats?.total_users || 0}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Users</div>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', background: 'rgba(45,212,191,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)' }}><FolderOpen size={24} /></div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{stats?.total_workspaces || 0}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Workspaces</div>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', background: 'rgba(251,191,36,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)' }}><FileText size={24} /></div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{stats?.total_files || 0}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Uploaded PDFs</div>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', background: 'rgba(244,63,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--rose)' }}><HardDrive size={24} /></div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{formatBytes(stats?.total_storage_bytes || 0)}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Storage Used</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Detailed Stats */}
          <div className="card">
            <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Activity size={18} style={{ color: 'var(--teal)' }} /> Engagement Metrics</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}><MessageSquare size={16} /> Chat Sessions</span>
                <span style={{ fontWeight: 600 }}>{stats?.total_conversations || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}><MessageSquare size={16} /> Messages Exchanged</span>
                <span style={{ fontWeight: 600 }}>{stats?.total_messages || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}><Brain size={16} /> Brainstorm Sessions</span>
                <span style={{ fontWeight: 600 }}>{stats?.total_brainstorms || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}><FileText size={16} /> Papers Written</span>
                <span style={{ fontWeight: 600 }}>{stats?.total_papers || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}><Database size={16} /> Vector Chunks</span>
                <span style={{ fontWeight: 600 }}>{stats?.total_chunks || 0}</span>
              </div>
            </div>
          </div>

          {/* Growth & Health */}
          <div className="card">
            <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Activity size={18} style={{ color: 'var(--accent-light)' }} /> System Health & Growth</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderLeft: '3px solid var(--accent-light)', background: 'var(--bg-secondary)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
                <span style={{ color: 'var(--text-secondary)' }}>New Users (7 days)</span>
                <span style={{ fontWeight: 600 }}>+{stats?.users_last_7_days || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderLeft: '3px solid var(--teal)', background: 'var(--bg-secondary)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
                <span style={{ color: 'var(--text-secondary)' }}>New Files (7 days)</span>
                <span style={{ fontWeight: 600 }}>+{stats?.files_last_7_days || 0}</span>
              </div>
              
              <div style={{ marginTop: 12 }}>
                <h5 style={{ marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Gemini API Usage (Today)</h5>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderLeft: '3px solid var(--blue)', background: 'var(--bg-secondary)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total AI Requests</span>
                  <span style={{ fontWeight: 600 }}>{stats?.api_usage_today || 0}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Warning: 1.5-Flash limit is 1,500/day. 2.5-Flash limit is 20/day.
                </div>
              </div>
              
              <div style={{ marginTop: 12 }}>
                <h5 style={{ marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>File Processing Status</h5>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(34,197,94,0.1)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--green)' }}>{stats?.files_by_status?.ready || 0}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ready</div>
                  </div>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(251,191,36,0.1)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--amber)' }}>{stats?.files_by_status?.processing || 0}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Processing</div>
                  </div>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(244,63,94,0.1)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--rose)' }}>{stats?.files_by_status?.error || 0}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Failed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
