'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Palette, Brain, Bell, Key, ShieldAlert, CheckCircle, Save, Loader, PaintBucket } from 'lucide-react';

const hexToRgb = (hex) => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) { r = parseInt(hex[1]+hex[1],16); g = parseInt(hex[2]+hex[2],16); b = parseInt(hex[3]+hex[3],16); }
  else if (hex.length === 7) { r = parseInt(hex.substring(1,3),16); g = parseInt(hex.substring(3,5),16); b = parseInt(hex.substring(5,7),16); }
  return `${r}, ${g}, ${b}`;
};

const adjustBrightness = (hex, percent) => {
  let r = parseInt(hex.substring(1,3),16); let g = parseInt(hex.substring(3,5),16); let b = parseInt(hex.substring(5,7),16);
  r = Math.min(255, Math.max(0, r + (r * percent / 100)));
  g = Math.min(255, Math.max(0, g + (g * percent / 100)));
  b = Math.min(255, Math.max(0, b + (b * percent / 100)));
  return `#${Math.round(r).toString(16).padStart(2,'0')}${Math.round(g).toString(16).padStart(2,'0')}${Math.round(b).toString(16).padStart(2,'0')}`;
};

const getLuminance = (hex) => {
  let r = parseInt(hex.substring(1,3),16)/255; let g = parseInt(hex.substring(3,5),16)/255; let b = parseInt(hex.substring(5,7),16)/255;
  let a = [r, g, b].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const supabase = createClient();

  // Profile Form
  const [fullName, setFullName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Appearance
  const [currentTheme, setCurrentTheme] = useState('midnight');
  const [customBg, setCustomBg] = useState('#0a0b0f');
  const [customAccent, setCustomAccent] = useState('#6366f1');

  // AI Config
  const [aiModel, setAiModel] = useState('gemini-2.5-flash');
  const [creativity, setCreativity] = useState(0.7);

  // Notifications
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSecurity, setNotifSecurity] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setFullName(user?.user_metadata?.full_name || '');
      if (user) {
        supabase.from('profiles').select('role').eq('id', user.id).single()
          .then(({ data }) => {
            if (data && (data.role === 'admin' || data.role === 'superadmin')) {
              setIsAdmin(true);
            }
          });
      }
    });
    
    const theme = localStorage.getItem('rminios-theme') || 'midnight';
    setCurrentTheme(theme);
    
    if (theme === 'custom') {
      const savedBg = localStorage.getItem('rminios-custom-bg');
      const savedAccent = localStorage.getItem('rminios-custom-accent');
      if (savedBg) setCustomBg(savedBg);
      if (savedAccent) setCustomAccent(savedAccent);
    }
    
    const savedModel = localStorage.getItem('rminios-model') || 'gemini-2.5-flash';
    setAiModel(savedModel);
  }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    });
    setSavingProfile(false);
    if (!error) {
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
      // update layout name by reloading window (or just rely on state if we passed it)
      // for now it will update on next refresh
    }
  };

  const applyCustomColors = (bgHex, accentHex) => {
    const root = document.documentElement;
    const isLight = getLuminance(bgHex) > 0.5;
    
    root.style.setProperty('--bg-primary', bgHex);
    root.style.setProperty('--bg-secondary', adjustBrightness(bgHex, isLight ? -5 : 5));
    root.style.setProperty('--bg-tertiary', adjustBrightness(bgHex, isLight ? -10 : 10));
    root.style.setProperty('--bg-card', `rgba(${hexToRgb(adjustBrightness(bgHex, isLight ? -5 : 5))}, 0.8)`);
    root.style.setProperty('--bg-glass', `rgba(${hexToRgb(bgHex)}, 0.8)`);
    
    root.style.setProperty('--accent', accentHex);
    root.style.setProperty('--accent-light', adjustBrightness(accentHex, 20));
    root.style.setProperty('--accent-glow', `rgba(${hexToRgb(accentHex)}, 0.4)`);
    root.style.setProperty('--bg-hover', `rgba(${hexToRgb(accentHex)}, 0.08)`);
    
    if (isLight) {
      root.style.setProperty('--text-primary', '#0f172a');
      root.style.setProperty('--text-secondary', '#334155');
      root.style.setProperty('--text-muted', '#64748b');
      root.style.setProperty('--border', `rgba(0,0,0, 0.1)`);
      root.style.setProperty('--border-hover', `rgba(0,0,0, 0.2)`);
    } else {
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#a1a1aa');
      root.style.setProperty('--text-muted', '#71717a');
      root.style.setProperty('--border', `rgba(255,255,255, 0.1)`);
      root.style.setProperty('--border-hover', `rgba(255,255,255, 0.2)`);
    }
  };

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
    localStorage.setItem('rminios-theme', theme);
    
    if (theme !== 'custom') {
      document.documentElement.removeAttribute('style'); // Clear custom inline styles
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      applyCustomColors(customBg, customAccent);
    }
  };

  const handleCustomColorChange = (type, hex) => {
    if (type === 'bg') {
      setCustomBg(hex);
      localStorage.setItem('rminios-custom-bg', hex);
      applyCustomColors(hex, customAccent);
    } else {
      setCustomAccent(hex);
      localStorage.setItem('rminios-custom-accent', hex);
      applyCustomColors(customBg, hex);
    }
    if (currentTheme !== 'custom') handleThemeChange('custom');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    ...(isAdmin ? [{ id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> }] : []),
    { id: 'ai', label: 'AI Preferences', icon: <Brain size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
  ];

  const themes = [
    { id: 'midnight', label: 'Midnight', color1: '#0a0b0f', color2: '#6366f1' },
    { id: 'amoled', label: 'Pure Black', color1: '#000000', color2: '#ffffff' },
    { id: 'ocean', label: 'Ocean Depth', color1: '#061114', color2: '#0ea5e9' },
    { id: 'sunset', label: 'Sunset Glow', color1: '#1c0d12', color2: '#e11d48' },
    { id: 'light', label: 'Crisp Light', color1: '#f8fafc', color2: '#4f46e5' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="topbar">
        <h3>Settings</h3>
      </div>
      
      <div className="page-content" style={{ display: 'flex', gap: 32, maxWidth: 1000 }}>
        
        {/* Settings Navigation */}
        <div style={{ width: 240, flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`sidebar-link ${activeTab === tab.id ? 'active' : ''}`}
                style={{ justifyContent: 'flex-start' }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div style={{ flex: 1 }}>
          
          {activeTab === 'profile' && (
            <div className="card" style={{ animation: 'fadeIn 0.3s' }}>
              <h4 style={{ marginBottom: 20 }}>Account Profile</h4>
              
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label>Full Name</label>
                <input 
                  className="input" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)} 
                />
              </div>
              
              <div className="input-group" style={{ marginBottom: 24 }}>
                <label>Email Address</label>
                <input className="input" value={user?.email || ''} readOnly style={{ opacity: 0.7 }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Contact support to change your email address.</p>
              </div>

              <button className="btn btn-primary" onClick={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                Save Changes
              </button>
              {profileSuccess && <span style={{ marginLeft: 12, color: 'var(--green)', fontSize: '0.85rem' }}><CheckCircle size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }}/> Profile updated</span>}
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="card" style={{ animation: 'fadeIn 0.3s' }}>
              <h4 style={{ marginBottom: 20 }}>Theme Configuration</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
                Choose a dynamic color palette for your workspace. Changes apply instantly.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                {themes.map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => handleThemeChange(t.id)}
                    style={{ 
                      padding: 16, borderRadius: 'var(--radius-md)', 
                      border: `2px solid ${currentTheme === t.id ? 'var(--accent)' : 'var(--border)'}`,
                      background: t.color1, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12, transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: t.color2 }} />
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-card)' }} />
                    </div>
                    <div style={{ fontWeight: 600, color: t.id === 'light' ? '#0f172a' : '#ffffff', fontSize: '0.9rem' }}>{t.label}</div>
                  </div>
                ))}
                
                {/* Custom Builder */}
                <div 
                  onClick={() => handleThemeChange('custom')}
                  style={{ 
                    padding: 16, borderRadius: 'var(--radius-md)', 
                    border: `2px solid ${currentTheme === 'custom' ? 'var(--accent)' : 'var(--border)'}`,
                    background: 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12, transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(45deg, #f43f5e, #6366f1, #2dd4bf)' }} />
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-card)' }} />
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Custom Theme</div>
                </div>
              </div>

              {currentTheme === 'custom' && (
                <div style={{ marginTop: 24, padding: 20, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', animation: 'fadeIn 0.3s' }}>
                  <h5 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}><PaintBucket size={16} /> Custom Color Palette</h5>
                  <div style={{ display: 'flex', gap: 24 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 8 }}>Background Color</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <input type="color" value={customBg} onChange={(e) => handleCustomColorChange('bg', e.target.value)} style={{ width: 40, height: 40, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer' }} />
                        <span style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{customBg}</span>
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 8 }}>Primary Accent Color</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <input type="color" value={customAccent} onChange={(e) => handleCustomColorChange('accent', e.target.value)} style={{ width: 40, height: 40, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer' }} />
                        <span style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{customAccent}</span>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 16 }}>Hover states, secondary backgrounds, and text contrast are calculated automatically.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="card" style={{ animation: 'fadeIn 0.3s' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Key size={18} style={{ color: 'var(--teal)' }} /> AI Integration Details
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
                Advanced settings for LLM generation parameters and context window configurations.
              </p>
              
              <div className="input-group" style={{ marginBottom: 20 }}>
                <label>Primary Language Model</label>
                <select 
                  className="input" 
                  value={aiModel} 
                  onChange={e => { setAiModel(e.target.value); localStorage.setItem('rminios-model', e.target.value); }}
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast & Efficient)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
                </select>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Used globally across Chat, Brainstorm, and Editor components.</p>
              </div>

              <div className="input-group" style={{ marginBottom: 24 }}>
                <label>Model Creativity (Temperature: {creativity})</label>
                <input 
                  type="range" 
                  min="0" max="1" step="0.1" 
                  value={creativity} 
                  onChange={e => setCreativity(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent)' }} 
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  <span>Precise / Analytical</span>
                  <span>Creative / Unbound</span>
                </div>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: 16, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="status-dot status-ready" />
                <span style={{ fontSize: '0.85rem', color: 'var(--green)' }}>API Connection Stable</span>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card" style={{ animation: 'fadeIn 0.3s' }}>
              <h4 style={{ marginBottom: 20 }}>Email & Notifications</h4>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>Workspace Activity Summaries</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Receive weekly digest emails about generated ideas and active papers.</div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" checked={notifEmail} onChange={e => setNotifEmail(e.target.checked)} style={{ accentColor: 'var(--accent)', transform: 'scale(1.2)' }} />
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>Security Alerts</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Get notified immediately when a new device signs into your workspace.</div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" checked={notifSecurity} onChange={e => setNotifSecurity(e.target.checked)} style={{ accentColor: 'var(--accent)', transform: 'scale(1.2)' }} />
                </label>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          {activeTab === 'profile' && (
            <div className="card" style={{ marginTop: 24, borderColor: 'var(--rose)' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--rose)', marginBottom: 8 }}>
                <ShieldAlert size={18} /> Danger Zone
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                Permanently delete your account and all associated research workspaces, papers, and files. This action cannot be undone.
              </p>
              <button className="btn btn-danger">Delete Account</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
