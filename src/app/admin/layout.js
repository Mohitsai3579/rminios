'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, Users, FolderOpen, Activity, ArrowLeft, Settings, CreditCard, Menu, X } from 'lucide-react';

export default function AdminLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile && (profile.role === 'admin' || profile.role === 'superadmin')) {
      setIsAdmin(true);
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  }

  const navItems = [
    { href: '/admin', icon: <Activity size={18} />, label: 'Overview' },
    { href: '/admin/activity', icon: <Activity size={18} />, label: 'Activity Radar' },
    { href: '/admin/rag', icon: <FolderOpen size={18} />, label: 'Knowledge Base (RAG)' },
    { href: '/admin/users', icon: <Users size={18} />, label: 'Users' },
    { href: '/admin/workspaces', icon: <FolderOpen size={18} />, label: 'Workspaces' },
    { href: '/admin/payments', icon: <CreditCard size={18} />, label: 'Payments & Billing' },
    { href: '/admin/settings', icon: <Settings size={18} />, label: 'System Settings' },
  ];

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><div className="spinner spinner-lg" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="app-layout">
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)} 
        className="mobile-menu-btn"
        aria-label="Toggle admin menu"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{ borderRightColor: 'rgba(244,63,94,0.15)' }}>
        <div className="sidebar-logo" style={{ marginBottom: 20 }}>
          <ShieldAlert size={22} style={{ color: 'var(--rose)' }} />
          <h2 style={{ background: 'linear-gradient(135deg, var(--rose), #fb7185)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Admin Panel</h2>
        </div>

        <div style={{ padding: '0 16px', marginBottom: 16 }}>
          <Link href="/dashboard" className="btn btn-secondary btn-sm w-full" style={{ justifyContent: 'center' }}>
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        </div>

        <div className="sidebar-section">Management</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`sidebar-link ${pathname === item.href ? 'active' : ''}`} 
              onClick={() => setSidebarOpen(false)}
              style={pathname === item.href ? { color: 'var(--rose)', background: 'rgba(244,63,94,0.1)' } : {}}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
