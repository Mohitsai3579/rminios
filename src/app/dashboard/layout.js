'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, LayoutDashboard, Settings, LogOut, Menu, X, 
  ShieldAlert, Code2, Bot, TrendingUp, Radio, FolderOpen, Plus, FolderGit2 
} from 'lucide-react';
import SoundscapePlayer from '@/components/SoundscapePlayer';

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [recentWorkspaces, setRecentWorkspaces] = useState([]);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        // Check if admin
        supabase.from('profiles').select('role').eq('id', user.id).single()
          .then(({ data }) => {
            if (data && (data.role === 'admin' || data.role === 'superadmin')) {
              setIsAdmin(true);
            }
          });

        // Fetch user's active workspaces for sidebar quick-access
        supabase.from('workspaces').select('id, name').order('updated_at', { ascending: false }).limit(4)
          .then(({ data }) => {
            if (data) setRecentWorkspaces(data);
          });
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navItems = [
    { href: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { href: '/dashboard/codestudio', icon: <Code2 size={18} />, label: 'Antigravity Studio', badge: 'AI Dev' },
    { href: '/dashboard/swarm', icon: <Bot size={18} />, label: 'AI Swarm Arena', badge: '4 Agents' },
    { href: '/dashboard/impact', icon: <TrendingUp size={18} />, label: 'Impact & Patents' },
    { href: '/dashboard/radar', icon: <Radio size={18} />, label: 'Literature Radar' },
    { href: '/dashboard/settings', icon: <Settings size={18} />, label: 'Settings & Fleet' },
  ];

  const isWorkspace = pathname.includes('/dashboard/workspace/');

  return (
    <div className="app-layout">
      {/* Mobile menu button */}
      {!isWorkspace && (
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn btn-icon btn-ghost" style={{ position: 'fixed', top: 12, left: 12, zIndex: 200, display: 'none' }}>
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Sidebar */}
      {!isWorkspace && (
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} style={{ color: '#fff' }} />
            </div>
            <div>
              <h2 className="text-gradient" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>RMinios</h2>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: 0.5 }}>RESEARCH OPERATING SYSTEM</div>
            </div>
          </div>

          <div className="sidebar-section">Platform Hub</div>
          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`sidebar-link ${isActive ? 'active' : ''}`} 
                  onClick={() => setSidebarOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: 10, background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(99, 102, 241, 0.2)', color: isActive ? '#fff' : 'var(--accent-light)', fontWeight: 700 }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Quick Workspaces Section */}
            <div className="sidebar-section" style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Workspaces</span>
              <Link href="/dashboard" style={{ fontSize: '0.7rem', color: 'var(--accent)', textDecoration: 'none' }}>
                View All
              </Link>
            </div>

            {recentWorkspaces.map(ws => (
              <Link
                key={ws.id}
                href={`/dashboard/workspace/${ws.id}`}
                className="sidebar-link"
                onClick={() => setSidebarOpen(false)}
                style={{ fontSize: '0.82rem', padding: '6px 12px' }}
              >
                <FolderOpen size={15} style={{ color: 'var(--text-muted)' }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ws.name}</span>
              </Link>
            ))}

            {isAdmin && (
              <>
                <div className="sidebar-section" style={{ marginTop: 24, color: 'var(--rose)' }}>Administration</div>
                <Link href="/admin" className="sidebar-link" onClick={() => setSidebarOpen(false)} style={{ color: 'var(--rose)' }}>
                  <ShieldAlert size={18} />
                  Admin Panel
                </Link>
              </>
            )}
          </nav>

          <div className="sidebar-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>
                  {user?.user_metadata?.full_name || 'Researcher'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email}
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="sidebar-link" style={{ color: 'var(--rose)', width: '100%', justifyContent: 'flex-start' }}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </aside>
      )}

      {/* Main content */}
      <main className={`main-content ${isWorkspace ? 'no-sidebar' : ''}`}>
        {children}
      </main>

      {/* Ambient Soundscape & Spotify Mini-Player accessible globally across dashboard */}
      {!isWorkspace && <SoundscapePlayer />}
    </div>
  );
}
