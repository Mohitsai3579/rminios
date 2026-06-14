'use client';

import { useState, useEffect } from 'react';
import { Activity, FileText, MessageSquare, Brain, Clock, FolderOpen } from 'lucide-react';

export default function AdminActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch('/api/admin/activity');
        if (!res.ok) throw new Error('Failed to fetch activity');
        const data = await res.json();
        setActivities(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchActivity();
  }, []);

  const getIcon = (type) => {
    switch(type) {
      case 'file': return <FileText size={18} className="text-emerald-500" />;
      case 'chat': return <MessageSquare size={18} className="text-blue-500" />;
      case 'brainstorm': return <Brain size={18} className="text-purple-500" />;
      case 'workspace': return <FolderOpen size={18} style={{ color: 'var(--amber)' }} />;
      default: return <Activity size={18} />;
    }
  };

  const getActionText = (type) => {
    switch(type) {
      case 'file': return 'uploaded document';
      case 'chat': return 'started a chat';
      case 'brainstorm': return 'generated ideas for';
      case 'workspace': return 'created a new workspace';
      default: return 'performed action';
    }
  };

  return (
    <>
      <div className="topbar">
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Activity size={20} /> Global Activity Radar</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Live feed of all user actions across the platform.</p>
        </div>
      </div>

      <div className="page-content" style={{ maxWidth: 800 }}>
        <div className="card">
          {loading ? (
            <p>Scanning platform activity...</p>
          ) : error ? (
            <p style={{ color: 'var(--rose)' }}>{error}</p>
          ) : activities.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No recent activity found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activities.map((act, i) => (
                <div key={i} style={{ 
                  display: 'flex', gap: 16, padding: 16, 
                  background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                  borderLeft: `4px solid ${act.type === 'file' ? 'var(--emerald)' : act.type === 'chat' ? 'var(--blue)' : act.type === 'workspace' ? 'var(--amber)' : 'var(--purple)'}`
                }}>
                  <div style={{ padding: 10, background: 'var(--bg-secondary)', borderRadius: '50%', height: 'fit-content' }}>
                    {getIcon(act.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{act.user}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> {new Date(act.date).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      {getActionText(act.type)} <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>"{act.title}"</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
