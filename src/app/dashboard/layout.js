'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, LayoutDashboard, Settings, LogOut, Menu, X, 
  ShieldAlert, Code2, Bot, TrendingUp, Radio, FolderOpen, 
  Plus, Award, ShieldCheck, Globe2, Terminal, Headphones, Scale, Rocket
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

  const fetchWorkspaces = useCallback(async (userId) => {
    try {
      const { data } = await supabase
        .from('workspaces')
        .select('id, name, updated_at')
        .order('updated_at', { ascending: false })
        .limit(15);
      if (data) setRecentWorkspaces(data);
    } catch (e) {
      console.warn('Failed to load workspaces:', e);
    }
  }, [supabase]);

  useEffect(() => {
    let channel = null;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        
        // Check admin privilege
        supabase.from('profiles').select('role').eq('id', user.id).single()
          .then(({ data }) => {
            if (data && (data.role === 'admin' || data.role === 'superadmin')) {
              setIsAdmin(true);
            }
          });

        // Initial workspace fetch
        fetchWorkspaces(user.id);

        // Real-time listener for workspace creation/rename/delete
        try {
          channel = supabase.channel('realtime:sidebar_workspaces')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'workspaces' }, () => {
              fetchWorkspaces(user.id);
            })
            .subscribe();
        } catch (e) {}
      }
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase, router, fetchWorkspaces]);

  // Refresh workspaces on route changes within dashboard
  useEffect(() => {
    if (user) {
      fetchWorkspaces(user.id);
    }
  }, [pathname, user, fetchWorkspaces]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navItems = [
    { href: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { href: '/dashboard/galaxy', icon: <Globe2 size={18} />, label: '3D Knowledge Galaxy', badge: '3D WebGL' },
    { href: '/dashboard/codestudio', icon: <Code2 size={18} />, label: 'Antigravity Studio', badge: 'AI Dev' },
    { href: '/dashboard/swarm', icon: <Bot size={18} />, label: 'AI Swarm Arena', badge: '4 Agents' },
    { href: '/dashboard/podcast', icon: <Headphones size={18} />, label: 'Audio Paper Studio', badge: 'Audio AI' },
    { href: '/dashboard/sandbox', icon: <Terminal size={18} />, label: 'Python Sandbox', badge: 'Replicate' },
    { href: '/dashboard/peer-review', icon: <Scale size={18} />, label: 'Peer Review Arena', badge: 'NeurIPS' },
    { href: '/dashboard/grants', icon: <Award size={18} />, label: 'Grants & Funding', badge: 'NSF/NIH' },
    { href: '/dashboard/integrity', icon: <ShieldCheck size={18} />, label: 'Integrity Shield', badge: 'Fact-Check' },
    { href: '/dashboard/venture', icon: <Rocket size={18} />, label: 'YC Venture Studio', badge: 'Startup' },
    { href: '/dashboard/impact', icon: <TrendingUp size={18} />, label: 'Impact & Patents' },
    { href: '/dashboard/radar', icon: <Radio size={18} />, label: 'Literature Radar' },
    { href: '/dashboard/settings', icon: <Settings size={18} />, label: 'Settings & Fleet' },
  ];

  const isWorkspace = pathname.includes('/dashboard/workspace/');

  return (
    <div className="app-layout">
      {/* Mobile Hamburger Menu Toggle Button (Visible on screens <= 768px) */}
      {!isWorkspace && (
        <>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="mobile-menu-btn"
            aria-label="Toggle navigation menu"
            title="Open Menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Dark backdrop overlay when mobile sidebar is open */}
          <div 
            className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
            onClick={() => setSidebarOpen(false)}
          />
        </>
      )}

      {/* Main Sidebar */}
      {!isWorkspace && (
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          {/* Header Logo */}
          <div className="sidebar-logo">
            <div style={{ 
              width: 32, 
              height: 32, 
              borderRadius: 10, 
              background: 'linear-gradient(135deg, var(--accent), var(--teal))', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)' 
            }}>
              <Sparkles size={17} style={{ color: '#fff' }} />
            </div>
            <div>
              <h2 className="text-gradient" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>RMinios</h2>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: 0.5, fontWeight: 600 }}>RESEARCH OPERATING SYSTEM</div>
            </div>
          </div>

          {/* Scrollable Navigation Area */}
          <nav className="sidebar-nav">
            <div className="sidebar-section">Platform Hub</div>
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
                    <span style={{ 
                      fontSize: '0.62rem', 
                      padding: '2px 7px', 
                      borderRadius: 10, 
                      background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(99, 102, 241, 0.2)', 
                      color: isActive ? '#fff' : 'var(--accent-light)', 
                      fontWeight: 700 
                    }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Quick Workspaces Section */}
            <div className="sidebar-section" style={{ marginTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Workspaces ({recentWorkspaces.length})</span>
              <Link 
                href="/dashboard" 
                onClick={() => setSidebarOpen(false)}
                style={{ fontSize: '0.68rem', color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 600 }}
              >
                View All
              </Link>
            </div>

            {recentWorkspaces.length === 0 ? (
              <div style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                No workspaces yet.
                <Link 
                  href="/dashboard" 
                  onClick={() => setSidebarOpen(false)}
                  style={{ display: 'block', marginTop: 4, color: 'var(--accent)', textDecoration: 'underline' }}
                >
                  + Create Workspace
                </Link>
              </div>
            ) : (
              recentWorkspaces.map(ws => (
                <Link
                  key={ws.id}
                  href={`/dashboard/workspace/${ws.id}`}
                  className="sidebar-link"
                  onClick={() => setSidebarOpen(false)}
                  style={{ fontSize: '0.8rem', padding: '7px 12px' }}
                >
                  <FolderOpen size={14} style={{ color: 'var(--teal)', flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ws.name}</span>
                </Link>
              ))
            )}

            {isAdmin && (
              <>
                <div className="sidebar-section" style={{ marginTop: 22, color: 'var(--rose)' }}>Administration</div>
                <Link 
                  href="/admin" 
                  className="sidebar-link" 
                  onClick={() => setSidebarOpen(false)} 
                  style={{ color: 'var(--rose)' }}
                >
                  <ShieldAlert size={17} />
                  Admin Panel
                </Link>
              </>
            )}
          </nav>

          {/* User Profile & Sign Out Footer (Always anchored at bottom) */}
          <div className="sidebar-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ 
                width: 34, 
                height: 34, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, var(--accent), var(--teal))', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '0.85rem', 
                fontWeight: 700, 
                color: 'white', 
                flexShrink: 0 
              }}>
                {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>
                  {user?.user_metadata?.full_name || 'Researcher'}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email}
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="sidebar-link" 
              style={{ color: 'var(--rose)', width: '100%', justifyContent: 'flex-start', padding: '6px 8px' }}
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </aside>
      )}

      {/* Main Page Content */}
      <main className={`main-content ${isWorkspace ? 'no-sidebar' : ''}`}>
        {children}
      </main>

      {/* Ambient Soundscape & Spotify Focus Suite */}
      {!isWorkspace && <SoundscapePlayer />}
    </div>
  );
}
