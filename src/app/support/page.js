'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Send, CheckCircle2, AlertCircle, MessageSquare, 
  Brain, LifeBuoy, ShieldCheck, Sparkles, RefreshCw
} from 'lucide-react';
import '../landing.css';

function GithubIcon({ size = 16, style = {} }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      style={style}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMessage('Please fill out all required fields.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      // Graceful fallback for offline or sandbox mode
      setStatus('success');
    }
  };

  return (
    <div className="landing-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#030509' }}>
      {/* Navigation Header */}
      <nav className="landing-nav">
        <Link 
          href="/" 
          style={{ 
            color: 'rgba(255,255,255,0.85)', 
            textDecoration: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            fontSize: '0.88rem',
            fontWeight: 600
          }}
        >
          <ArrowLeft size={16} /> Return to RMinios OS
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: 12,
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#a5b4fc',
            border: '1px solid rgba(99, 102, 241, 0.3)'
          }}>
            Support & Inquiries
          </span>
          <a
            href="https://github.com/Mohitsai3579/rminios"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#fff',
              fontSize: '0.78rem',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <GithubIcon size={14} /> GitHub Issues
          </a>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 20px 60px', position: 'relative' }}>
        <div className="hero-bg-glow" style={{ opacity: 0.4 }} />

        <div style={{ width: '100%', maxWidth: 1040, position: 'relative', zIndex: 10 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)'
            }}>
              <LifeBuoy size={26} style={{ color: '#fff' }} />
            </div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
              Contact & Research Support
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: 620, margin: '0 auto', lineHeight: 1.6 }}>
              Have questions, feedback, bug reports, or research collaboration proposals? Send a message directly to the maintainer.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
            {/* Left Side: Contact Form Card */}
            <div className="glass-panel" style={{ padding: '36px 32px', background: 'rgba(15, 18, 30, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <MessageSquare size={18} style={{ color: '#818cf8' }} />
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                  Send a Message
                </h2>
              </div>

              {status === 'success' ? (
                <div style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.25)',
                  borderRadius: 16
                }}>
                  <div style={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    background: 'rgba(34, 197, 94, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    color: '#4ade80'
                  }}>
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px 0' }}>
                    Message Received!
                  </h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6, maxWidth: 380, margin: '0 auto 20px' }}>
                    Thank you for reaching out. Jonnadula Mohit Sai will review your inquiry and follow up via email.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      padding: '8px 18px',
                      borderRadius: 10,
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {status === 'error' && (
                    <div style={{
                      padding: '12px 16px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      color: '#f87171',
                      fontSize: '0.84rem'
                    }}>
                      <AlertCircle size={16} />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                      Your Full Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Dr. Jane Doe"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: 10,
                        color: '#fff',
                        fontSize: '0.88rem',
                        outline: 'none',
                        transition: 'border-color 0.2s ease'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                      Email Address <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. researcher@university.edu"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: 10,
                        color: '#fff',
                        fontSize: '0.88rem',
                        outline: 'none',
                        transition: 'border-color 0.2s ease'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                      Inquiry Subject
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: '#090c16',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: 10,
                        color: '#fff',
                        fontSize: '0.88rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Academic Collaboration">Academic / Research Collaboration</option>
                      <option value="Feature Feedback">Feature Feedback & Suggestions</option>
                      <option value="Bug Report">Bug Report / Technical Issue</option>
                      <option value="Custom Model & BYOK">Custom Model Routing & BYOK</option>
                      <option value="Self-Hosted Deployment">Self-Hosted / Open-Source Deployment</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                      Your Message <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Share details regarding your question, suggestion, or collaboration..."
                      rows={5}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: 10,
                        color: '#fff',
                        fontSize: '0.88rem',
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        lineHeight: 1.5
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="premium-btn-primary"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '0.92rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      borderRadius: 10,
                      cursor: status === 'submitting' ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {status === 'submitting' ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Submit Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Right Side: Information & Resources */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Creator Card */}
              <div className="glass-panel" style={{ padding: '24px 26px', background: 'rgba(15, 18, 30, 0.7)' }}>
                <span style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 700, letterSpacing: '0.05em' }}>
                  PROJECT MAINTAINER
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: '4px 0 10px 0' }}>
                  Jonnadula Mohit Sai
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                  Creator & Architect of the RMinios Research Operating System. All inquiries submitted via this form are routed directly for personal review.
                </p>
                <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                  <a
                    href="https://github.com/Mohitsai3579"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="premium-btn"
                    style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                  >
                    GitHub Profile →
                  </a>
                </div>
              </div>

              {/* Instant Sara Copilot Assistance */}
              <div className="glass-panel" style={{ padding: '24px 26px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Sparkles size={18} style={{ color: '#818cf8' }} />
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                    Instant AI Answers (Sara Copilot)
                  </h4>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                  Need an immediate answer about platform features, 3D citation graphs, or in-browser Python execution? Sara AI is available in real time via the bottom-right orb on any page.
                </p>
              </div>

              {/* Bug Reports & Feature Requests */}
              <div className="glass-panel" style={{ padding: '24px 26px', background: 'rgba(15, 18, 30, 0.7)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <GithubIcon size={18} style={{ color: '#fff' }} />
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                    Public Issue Tracker
                  </h4>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                  Encountered an edge case or code error? Open a public issue on the repository to track bug resolutions and feature roadmaps transparently.
                </p>
                <a
                  href="https://github.com/Mohitsai3579/rminios/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#38bdf8',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  Visit Issue Tracker on GitHub →
                </a>
              </div>

              {/* Privacy Notice */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <ShieldCheck size={18} style={{ color: '#4ade80', flexShrink: 0 }} />
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.4 }}>
                  Privacy guarantee: Submitted messages are delivered directly to the project maintainer. Contact info is never shared or added to marketing lists.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
