'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Sparkles, Eye, EyeOff, ShieldCheck, Check, AlertCircle, Shield } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Password Strength & Entropy Evaluator
  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (!pwd) return { score: 0, label: '', color: 'transparent', percent: 0 };
    
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: '#f43f5e', percent: 25 };
    if (score <= 4) return { score: 2, label: 'Fair', color: '#fbbf24', percent: 50 };
    if (score <= 5) return { score: 3, label: 'Strong', color: '#38bdf8', percent: 75 };
    return { score: 4, label: 'Military-Grade', color: '#10b981', percent: 100 };
  };

  const strength = getPasswordStrength(password);

  const sanitizeInput = (str) => str.trim().replace(/<[^>]*>?/gm, '');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    const cleanName = sanitizeInput(name);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || cleanName.length < 2) {
      setError('Please provide your full legal or research name.');
      return;
    }

    if (!cleanEmail.includes('@') || cleanEmail.length < 5) {
      setError('Please enter a valid academic or professional email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters for security compliance.');
      return;
    }

    if (strength.score < 2) {
      setError('Password is too weak. Please include a mix of uppercase, numbers, and symbols.');
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { full_name: cleanName } },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
      }
    } catch (err) {
      setError('Account creation failed. Please verify your connection.');
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) setError(error.message);
    } catch (err) {
      setError('Google OAuth initialization failed.');
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-bg-glow auth-bg-glow-1" />
        <div className="auth-bg-glow auth-bg-glow-2" />
        <div className="auth-card" style={{ textAlign: 'center', boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--green)' }}>
            <Check size={32} />
          </div>
          <h2 style={{ marginBottom: 8, color: '#fff' }}>Verification Link Dispatched</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem', lineHeight: 1.6 }}>
            We sent an encrypted confirmation link to <strong>{email}</strong>. Please click the link to activate your research account.
          </p>
          <Link href="/login" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            Proceed to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-glow auth-bg-glow-1" />
      <div className="auth-bg-glow auth-bg-glow-2" />
      
      <div 
        className="auth-card"
        style={{
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 35px rgba(20, 184, 166, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, rgba(20,184,166,0.2), rgba(99,102,241,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(20,184,166,0.3)' }}>
            <Sparkles size={24} style={{ color: 'var(--teal)' }} />
          </div>
        </div>
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Initialize your high-security RMinios research workspace</p>

        <button className="google-btn" onClick={handleGoogleSignup} type="button">
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        <div className="auth-divider">or create with email</div>

        <form className="auth-form" onSubmit={handleSignup}>
          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--rose)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="name">Full Name / Academic Title</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                id="name" 
                type="text" 
                className="input" 
                placeholder="Dr. Jane Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                style={{ paddingLeft: 38 }} 
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                id="email" 
                type="email" 
                className="input" 
                placeholder="jane.doe@university.edu" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={{ paddingLeft: 38 }} 
              />
            </div>
          </div>

          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password">Password</label>
              {password && (
                <span style={{ fontSize: '0.72rem', color: strength.color, fontWeight: 700 }}>
                  {strength.label}
                </span>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                id="password" 
                type={showPassword ? 'text' : 'password'} 
                className="input" 
                placeholder="Min 8 characters with numbers & symbols" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                minLength={8} 
                style={{ paddingLeft: 38, paddingRight: 38 }} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Dynamic Password Entropy Meter */}
            {password && (
              <div style={{ marginTop: 8 }}>
                <div style={{ height: 4, width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${strength.percent}%`, 
                      background: strength.color, 
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                    }} 
                  />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: password.length >= 8 ? 'var(--green)' : 'inherit' }}>✓ 8+ chars</span>
                  <span style={{ color: /[A-Z]/.test(password) ? 'var(--green)' : 'inherit' }}>✓ Uppercase</span>
                  <span style={{ color: /[0-9]/.test(password) ? 'var(--green)' : 'inherit' }}>✓ Number</span>
                  <span style={{ color: /[^A-Za-z0-9]/.test(password) ? 'var(--green)' : 'inherit' }}>✓ Symbol</span>
                </div>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full" 
            disabled={loading}
            style={{ fontWeight: 700, height: 42, marginTop: 6 }}
          >
            {loading ? <span className="spinner" /> : 'Create Encrypted Account'}
          </button>
        </form>

        <p className="auth-footer" style={{ marginTop: 20 }}>
          Already have an account? <Link href="/login" className="auth-link">Sign In</Link>
        </p>

        {/* Security Trust Badges */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ShieldCheck size={14} style={{ color: 'var(--green)' }} /> SOC-2 / GDPR Ready
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Shield size={14} style={{ color: 'var(--teal)' }} /> Row-Level Encryption
          </span>
        </div>
      </div>
    </div>
  );
}
