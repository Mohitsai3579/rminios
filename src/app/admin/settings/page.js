'use client';

import { useState, useEffect } from 'react';
import { Save, Server, ShieldAlert, Cpu, Settings as SettingsIcon, AlertTriangle, Key, Activity } from 'lucide-react';

export default function AdminSettingsPage() {
  const [provider, setProvider] = useState('anthropic');
  const [contextLimit, setContextLimit] = useState(128000);
  const [systemPrompt, setSystemPrompt] = useState('You are RMinios, an advanced AI research operating system designed to assist users with academic writing and brainstorming.');
  
  // Site Settings
  const [ownerName, setOwnerName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');

  // Fleet API Keys & Toggles
  const [fleet, setFleet] = useState({
    google: { enabled: true, key: '***********************' },
    anthropic: { enabled: false, key: '' },
    openai: { enabled: false, key: '' },
    grok: { enabled: false, key: '' }
  });

  const [storageLimit, setStorageLimit] = useState(2000); // MB
  const [workspaceLimit, setWorkspaceLimit] = useState(5);
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if(data && !data.error) {
          setOwnerName(data.owner_name || '');
          setSupportEmail(data.support_email || '');
          setSupportPhone(data.support_phone || '');
        }
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify({
          owner_name: ownerName,
          support_email: supportEmail,
          support_phone: supportPhone
        })
      });
    } catch(err) {
      console.error(err);
    }
    setTimeout(() => setSaving(false), 800);
  };

  const toggleFleet = (id) => {
    setFleet(prev => ({ ...prev, [id]: { ...prev[id], enabled: !prev[id].enabled } }));
  };
  const setFleetKey = (id, key) => {
    setFleet(prev => ({ ...prev, [id]: { ...prev[id], key } }));
  };

  return (
    <>
      <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><SettingsIcon size={20} /> System Settings</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Multi-LLM Fleet management and global configuration.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : <><Save size={16} /> Save Configuration</>}
        </button>
      </div>

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800 }}>
        
        {/* Multi-LLM Fleet Config */}
        <div className="card" style={{ borderColor: 'var(--accent)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Cpu size={18} style={{ color: 'var(--accent)' }} /> Multi-LLM Fleet Integration
          </h4>

          {/* Provider List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            {[
              { id: 'google', name: 'Google (Gemini 2.5)', color: 'var(--blue)' },
              { id: 'anthropic', name: 'Anthropic (Claude 3.5)', color: 'var(--amber)' },
              { id: 'openai', name: 'OpenAI (GPT-4o)', color: 'var(--emerald)' },
              { id: 'grok', name: 'xAI (Grok)', color: 'var(--purple)' }
            ].map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: fleet[p.id].enabled ? p.color : 'var(--text-muted)' }} />
                    {p.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Activity size={12} /> {fleet[p.id].enabled ? Math.floor(Math.random() * 500000 + 10000).toLocaleString() + ' tokens used' : 'Offline'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 2 }}>
                  <Key size={14} style={{ color: 'var(--text-muted)' }} />
                  <input type="password" placeholder="API Key" className="input" value={fleet[p.id].key} onChange={e => setFleetKey(p.id, e.target.value)} style={{ flex: 1 }} />
                </div>
                <div>
                  <button onClick={() => toggleFleet(p.id)} className="btn" style={{ padding: '6px 12px', background: fleet[p.id].enabled ? 'var(--bg-secondary)' : 'transparent', border: `1px solid ${fleet[p.id].enabled ? 'var(--accent)' : 'var(--border)'}`, color: fleet[p.id].enabled ? 'var(--accent)' : 'var(--text-muted)' }}>
                    {fleet[p.id].enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="input-group" style={{ marginBottom: 16 }}>
            <label>Master Default Routing</label>
            <select className="input" value={provider} onChange={e => setProvider(e.target.value)}>
              <option value="google">Google (Gemini 2.5 Flash)</option>
              <option value="anthropic" disabled={!fleet.anthropic.enabled}>Anthropic (Claude 3.5 Sonnet)</option>
              <option value="openai" disabled={!fleet.openai.enabled}>OpenAI (GPT-4o)</option>
              <option value="grok" disabled={!fleet.grok.enabled}>xAI (Grok)</option>
            </select>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Fallback provider if users don't specify one.</p>
          </div>

          <div className="input-group" style={{ marginBottom: 16 }}>
            <label>Global Context Limit ({contextLimit.toLocaleString()} tokens)</label>
            <input type="range" min="8000" max="200000" step="1000" value={contextLimit} onChange={e => setContextLimit(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>

          <div className="input-group">
            <label>Global System Prompt Override</label>
            <textarea className="input" rows="3" value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} />
          </div>
        </div>

        {/* User Quotas & Limits */}
        <div className="card">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Server size={18} style={{ color: 'var(--teal)' }} /> Default Quotas & Limits
          </h4>
          
          <div style={{ display: 'flex', gap: 24 }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Free Tier Storage Limit (MB)</label>
              <input type="number" className="input" value={storageLimit} onChange={e => setStorageLimit(Number(e.target.value))} />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Max Workspaces per User</label>
              <input type="number" className="input" value={workspaceLimit} onChange={e => setWorkspaceLimit(Number(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Maintenance Actions */}
        <div className="card" style={{ borderColor: 'var(--rose)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, color: 'var(--rose)' }}>
            <AlertTriangle size={18} /> System Maintenance Actions
          </h4>
          
          <div style={{ display: 'flex', gap: 16 }}>
            <button className="btn btn-secondary" style={{ flex: 1, borderColor: 'var(--rose)', color: 'var(--rose)' }}>
              Clear Orphaned Cache
            </button>
          </div>
        </div>

        {/* Public Settings */}
        <div className="card" style={{ marginTop: 8, borderColor: 'var(--border)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <ShieldAlert size={18} style={{ color: 'var(--teal)' }} /> Public Site & Support Settings
          </h4>
          <div className="input-group" style={{ marginBottom: 16 }}>
            <label>Owner / Creator Name</label>
            <input type="text" className="input" value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="e.g. Mohit Jonnadula" />
          </div>
          <div className="input-group" style={{ marginBottom: 16 }}>
            <label>Support Email Address</label>
            <input type="email" className="input" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} placeholder="e.g. mohitjonnadula16@gmail.com" />
          </div>
          <div className="input-group">
            <label>Support Phone Number</label>
            <input type="text" className="input" value={supportPhone} onChange={e => setSupportPhone(e.target.value)} placeholder="e.g. 9494366318" />
          </div>
        </div>

      </div>
    </>
  );
}
