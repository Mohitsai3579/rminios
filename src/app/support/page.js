import Link from 'next/link';
import { ArrowLeft, Mail, Phone, User, LifeBuoy } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import '../landing.css'; // Use landing page styles

export const revalidate = 0; // Prevent caching to ensure it's always dynamic

export default async function SupportPage() {
  const supabase = await createClient();
  let ownerName = 'Mohit Jonnadula';
  let supportEmail = 'mohitjonnadula16@gmail.com';
  let supportPhone = '9494366318';

  const { data } = await supabase.from('site_settings').select('*').eq('id', 'global').single();
  if (data) {
    ownerName = data.owner_name;
    supportEmail = data.support_email;
    supportPhone = data.support_phone;
  }

  return (
    <div className="landing-container" data-theme="midnight" style={{ backgroundColor: '#000', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      <style dangerouslySetInnerHTML={{__html: `
        body, html {
          background-color: #000 !important;
          color: #fff !important;
        }
      `}} />

      {/* Navigation */}
      <nav className="landing-nav">
        <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative' }}>
        {/* Glow Background */}
        <div className="hero-bg-glow" style={{ opacity: 0.5 }} />

        <div className="glass-panel" style={{ maxWidth: 600, width: '100%', position: 'relative', zIndex: 10, padding: '60px 40px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', color: '#818cf8', boxShadow: '0 0 20px rgba(99,102,241,0.2)' }}>
            <LifeBuoy size={32} />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 16 }}>Contact Support</h1>
          <p style={{ color: '#888', marginBottom: 40, fontSize: '1.1rem' }}>
            We're here to help you get the most out of RMinios OS.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
              <User size={24} style={{ color: '#22c55e' }} />
              <div>
                <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: 4 }}>Owner & Creator</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{ownerName}</div>
              </div>
            </div>

            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
              <Mail size={24} style={{ color: '#38bdf8' }} />
              <div>
                <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: 4 }}>Support Email</div>
                <a href={`mailto:${supportEmail}`} style={{ fontSize: '1.1rem', fontWeight: 600, color: '#38bdf8', textDecoration: 'none' }}>{supportEmail}</a>
              </div>
            </div>

            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
              <Phone size={24} style={{ color: '#a855f7' }} />
              <div>
                <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: 4 }}>Phone Support</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{supportPhone}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
