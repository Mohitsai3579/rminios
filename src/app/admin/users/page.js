'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Shield, ShieldAlert, User as UserIcon, MoreVertical, Edit2 } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function updateUser(userId, role, is_active) {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role, is_active }),
      });
      if (res.ok) {
        fetchUsers();
        setEditingUser(null);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h3>User Management</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manage platform users and roles</p>
        </div>
      </div>

      <div className="page-content">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>User</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Role</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Joined</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ padding: 48, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>No users found</td></tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: 500 }}>{u.full_name || 'No Name'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        {u.role === 'superadmin' ? (
                          <span className="badge badge-rose" style={{ gap: 4 }}><ShieldAlert size={12} /> Super Admin</span>
                        ) : u.role === 'admin' ? (
                          <span className="badge badge-amber" style={{ gap: 4 }}><Shield size={12} /> Admin</span>
                        ) : (
                          <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', gap: 4 }}><UserIcon size={12} /> User</span>
                        )}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        {u.is_active ? (
                          <span className="badge badge-green">Active</span>
                        ) : (
                          <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>Disabled</span>
                        )}
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <button className="btn btn-icon btn-ghost" onClick={() => setEditingUser(u)} title="Edit user">
                          <Edit2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setEditingUser(null)}>✕</button>
            </div>
            
            <div style={{ marginBottom: 24, padding: 16, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontWeight: 600 }}>{editingUser.full_name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{editingUser.email}</div>
            </div>

            <div className="input-group" style={{ marginBottom: 16 }}>
              <label>Role</label>
              <select className="input" value={editingUser.role} onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>

            <div className="input-group" style={{ marginBottom: 24 }}>
              <label>Status</label>
              <select className="input" value={editingUser.is_active ? 'active' : 'disabled'} onChange={(e) => setEditingUser({...editingUser, is_active: e.target.value === 'active'})}>
                <option value="active">Active</option>
                <option value="disabled">Disabled (Cannot login)</option>
              </select>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => updateUser(editingUser.id, editingUser.role, editingUser.is_active)}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
