'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, ExternalLink, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function AdminWorkspacesPage() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  async function fetchWorkspaces() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/workspaces');
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function deleteWorkspace(id) {
    try {
      const res = await fetch(`/api/admin/workspaces?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setWorkspaces(prev => prev.filter(w => w.id !== id));
        setDeleting(null);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h3>Workspace Oversight</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monitor and manage user workspaces</p>
        </div>
      </div>

      <div className="page-content">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Workspace</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Owner</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Files</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Created</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ padding: 48, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
                ) : workspaces.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>No workspaces found</td></tr>
                ) : (
                  workspaces.map(w => (
                    <tr key={w.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {w.icon || '🔬'} {w.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {w.description || 'No description'}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: 500 }}>{w.profiles?.full_name || 'Unknown'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{w.profiles?.email}</div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span className="badge badge-teal">{w.file_count || 0}</span>
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {formatDistanceToNow(new Date(w.created_at), { addSuffix: true })}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button className="btn btn-icon btn-ghost" onClick={() => setDeleting(w)} style={{ color: 'var(--rose)' }} title="Delete Workspace">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {deleting && (
        <div className="modal-overlay" onClick={() => setDeleting(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--rose)' }}><AlertTriangle size={20} /> Confirm Deletion</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setDeleting(null)}>✕</button>
            </div>
            
            <p style={{ marginBottom: 16 }}>Are you sure you want to delete this workspace? This action is <strong>irreversible</strong> and will delete:</p>
            <ul style={{ paddingLeft: 20, marginBottom: 24, color: 'var(--text-secondary)' }}>
              <li>All uploaded PDF files</li>
              <li>Vector embeddings and chat history</li>
              <li>Generated papers and brainstorms</li>
            </ul>

            <div style={{ padding: 16, background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 'var(--radius-sm)', marginBottom: 24 }}>
              <div style={{ fontWeight: 600, color: 'var(--rose)' }}>{deleting.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Owner: {deleting.profiles?.email}</div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleting(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => deleteWorkspace(deleting.id)}>Delete Workspace</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
