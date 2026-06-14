'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, LayoutDashboard, FolderOpen, Settings, LogOut, Menu, X, ShieldAlert } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navItems = [
    { href: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { href: '/dashboard/settings', icon: <Settings size={18} />, label: 'Settings' },
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
          <div className="sidebar-logo">
            <Sparkles size={22} style={{ color: 'var(--accent-light)' }} />
            <h2 className="text-gradient">RMinios</h2>
          </div>

          <div className="sidebar-section">Main</div>
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={`sidebar-link ${pathname === item.href ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                {item.icon}
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <>
                <div className="sidebar-section" style={{ marginTop: 24, color: 'var(--rose)' }}>Admin</div>
                <Link href="/admin" className="sidebar-link" onClick={() => setSidebarOpen(false)} style={{ color: 'var(--rose)' }}>
                  <ShieldAlert size={18} />
                  Admin Panel
                </Link>
              </>
            )}
          </nav>

          <div className="sidebar-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600, color: 'white' }}>
                {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.user_metadata?.full_name || 'Researcher'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email}
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="sidebar-link" style={{ color: 'var(--rose)' }}>
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </aside>
      )}

      {/* Main content */}
      <main className={`main-content ${isWorkspace ? 'no-sidebar' : ''}`}>
        {children}
      </main>
    </div>
  );
}
