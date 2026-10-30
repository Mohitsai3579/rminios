'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Send, X, Minimize2, Maximize2, Sparkles, Server, BarChart, 
  FileText, RefreshCw, Calendar, Cpu, Compass, FlaskConical, 
  Mic, ShieldCheck, Rocket, ChevronDown, Lock, CheckCircle2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { createClient } from '@/lib/supabase/client';
import { useDynamicIsland } from '@/context/DynamicIslandContext';

const MAX_GUEST_QUERIES = 3;

const QUICK_ACTIONS = [
  { label: "📅 What is today's date & day?", prompt: "What is today's exact date, day of the week, and current time?" },
  { label: "🌌 3D Research Galaxy", prompt: "Explain how to use the 3D Citation Constellation & Knowledge Galaxy to find unexplored research gaps." },
  { label: "🧪 In-Browser Python Sandbox", prompt: "How does the In-Browser Python Experiment Sandbox validate scientific formulas using Pyodide?" },
  { label: "🎙️ Autonomous Podcast", prompt: "How can I convert my paper into a NotebookLM-style dual-host audio podcast?" },
  { label: "⚖️ Adversarial Peer Review", prompt: "How does the Multi-Agent Adversarial Peer Review Committee evaluate research papers?" },
  { label: "🚀 Venture Studio Deck", prompt: "How does RMinios convert an academic paper into a YC-style 10-slide venture pitch deck?" },
  { label: "🛡️ Citation Integrity Shield", prompt: "How does the Scientific Integrity Shield detect retracted citations and hallucinated claims?" }
];

const PROVIDERS = [
  { id: 'google', name: 'Gemini 2.5 Flash', tag: 'Fast & Deep' },
  { id: 'openai', name: 'OpenAI GPT-4o', tag: 'Reasoning' },
  { id: 'anthropic', name: 'Claude 3.5 Sonnet', tag: 'Academic' },
  { id: 'grok', name: 'xAI Grok 2', tag: 'Adversarial' }
];

export default function SaraAssistant() {
  const supabase = createClient();
  const { showNotification } = useDynamicIsland();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [userId, setUserId] = useState('visitor');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [guestQueryCount, setGuestQueryCount] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState('google');
  const [liveDateString, setLiveDateString] = useState('');
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Hello! I am Sara, your Principal AI Solutions Architect & Autonomous Research Copilot. I have full real-time clock awareness and deep command over all 52 RMinios research engines. How can I assist your discovery today?',
      provider: 'Gemini 2.5 Flash'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Update live clock
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const dateStr = new Intl.DateTimeFormat('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(now);
        setLiveDateString(dateStr);
      } catch (e) {}
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Monitor auth status & load guest count
  useEffect(() => {
    // Initial check
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        setIsAuthenticated(true);
      } else {
        setUserId('visitor');
        setIsAuthenticated(false);
        try {
          const storedCount = parseInt(localStorage.getItem('sara_guest_query_count') || '0', 10);
          setGuestQueryCount(isNaN(storedCount) ? 0 : storedCount);
        } catch (e) {}
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        setIsAuthenticated(true);
      } else {
        setUserId('visitor');
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  // Sync open state to document.body so floating elements coordinate
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isOpen && !isMinimized) {
        document.body.classList.add('sara-open');
      } else {
        document.body.classList.remove('sara-open');
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('sara-open');
      }
    };
  }, [isOpen, isMinimized]);

  // Load chat history
  useEffect(() => {
    const saved = localStorage.getItem(`sara_history_${userId}`);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch(e) {}
    } else {
      setMessages([{ 
        role: 'assistant', 
        content: 'Hello! I am Sara, your Principal AI Solutions Architect & Autonomous Research Copilot. I have full real-time clock awareness and deep command over all 52 RMinios research engines. How can I assist your discovery today?',
        provider: 'Gemini 2.5 Flash'
      }]);
    }
  }, [userId]);

  // Persist chat history
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem(`sara_history_${userId}`, JSON.stringify(messages));
    }
  }, [messages, userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const sendMessage = async (userPrompt) => {
    const promptText = (userPrompt || input).trim();
    if (!promptText || loading) return;

    // Check Guest Limit
    if (!isAuthenticated && guestQueryCount >= MAX_GUEST_QUERIES) {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: promptText },
        {
          role: 'assistant',
          content: '🔒 **Free Guest Preview Limit Reached (3/3 queries used).**\n\nTo continue asking unlimited questions, generating full research papers, and running multi-agent AI pipelines, create your free RMinios account!',
          provider: 'Access Guard',
          isSignupPrompt: true
        }
      ]);
      setInput('');
      return;
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: promptText }]);
    setLoading(true);

    try {
      // Gather real-time local temporal context
      const now = new Date();
      const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
      const clientFormattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: clientTimezone
      }).format(now);
      const clientTimeStr = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
        timeZone: clientTimezone
      }).format(now);

      // Retrieve optional user frontier API keys from localStorage
      const userKeys = {
        openai: localStorage.getItem('rminios-key-openai') || '',
        anthropic: localStorage.getItem('rminios-key-anthropic') || '',
        grok: localStorage.getItem('rminios-key-grok') || ''
      };

      const res = await fetch('/api/sara', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: promptText, 
          history: messages,
          clientTime: now.getTime(),
          clientTimezone,
          clientFormattedDate,
          clientTimeStr,
          provider: selectedProvider,
          userKeys
        })
      });
      
      // Safely parse JSON or text response to avoid throwing SyntaxError on HTML error pages
      let data = null;
      try {
        const rawText = await res.text();
        try {
          data = JSON.parse(rawText);
        } catch (jsonErr) {
          data = { reply: rawText };
        }
      } catch (readErr) {
        data = { reply: `Failed to read server response: ${readErr.message}` };
      }

      if (res.ok && data?.reply) {
        let replyContent = data.reply;
        let isLastGuestQuery = false;

        // If guest, increment guest counter and append motivational signup teaser
        if (!isAuthenticated) {
          const nextCount = guestQueryCount + 1;
          setGuestQueryCount(nextCount);
          try {
            localStorage.setItem('sara_guest_query_count', nextCount.toString());
          } catch (e) {}

          if (nextCount < MAX_GUEST_QUERIES) {
            replyContent += `\n\n---\n*💡 Free Guest Preview: ${MAX_GUEST_QUERIES - nextCount} question${MAX_GUEST_QUERIES - nextCount === 1 ? '' : 's'} remaining. [Sign up free](/signup) to unlock unlimited autonomous research, full code synthesis, Swarm Arena, and 50+ AI engines!*`;
          } else {
            isLastGuestQuery = true;
          }
        }

        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: replyContent,
          provider: data.providerUsed || 'RMinios Fleet',
          timestamp: data.timestamp,
          isSignupPrompt: isLastGuestQuery
        }]);

        showNotification({
          title: 'Sara Copilot Synthesized',
          message: `Answer ready via ${data.providerUsed || 'RMinios Fleet'}`,
          icon: <Sparkles size={16} />,
          type: 'purple'
        });
      } else {
        const errorContent = 
          data?.reply || 
          data?.error || 
          (res.status === 401 
            ? '🔒 Please sign in to access full Sara AI features.' 
            : `⚠️ Server reported status ${res.status}. Please try again or switch model.`);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: errorContent,
          provider: 'Sara Safeguard'
        }]);
      }
    } catch (err) {
      console.error('Sara client fetch error:', err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `⚠️ Connection Issue: ${err.message || 'Server did not respond'}. Please check your connection and retry.`,
        provider: 'Network Diagnostics'
      }]);
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const clearHistory = (e) => {
    e.stopPropagation();
    const initialMsg = [{ 
      role: 'assistant', 
      content: 'Conversation history reset. I am Sara, your Principal Research Copilot. How can I assist you?',
      provider: 'Gemini 2.5 Flash'
    }];
    setMessages(initialMsg);
    localStorage.removeItem(`sara_history_${userId}`);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="sara-orb"
        title="Wake Sara AI Copilot"
      >
        <div className="sara-orb-core" />
        <div className="sara-orb-ring ring-1" />
        <div className="sara-orb-ring ring-2" />
        <div className="sara-orb-ring ring-3" />
        <Sparkles size={20} style={{ position: 'absolute', zIndex: 10, color: '#fff' }} />
      </button>
    );
  }

  const isGuestExhausted = !isAuthenticated && guestQueryCount >= MAX_GUEST_QUERIES;

  return (
    <div className={`sara-window ${isMinimized ? 'minimized' : ''}`}>
      {/* Header */}
      <div className="sara-header" onClick={() => setIsMinimized(!isMinimized)}>
        {/* Top Line: Brand + Guest Badge + Controls */}
        <div className="sara-header-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div className="sara-avatar-mini">
              <div className="sara-orb-core-mini" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
                Sara Copilot
              </h3>
              {isAuthenticated ? (
                <span className="badge badge-accent" style={{ fontSize: '0.58rem', padding: '1px 6px', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.35)', whiteSpace: 'nowrap' }}>
                  Full Access
                </span>
              ) : (
                <span className="badge badge-accent" style={{ fontSize: '0.58rem', padding: '1px 6px', background: 'rgba(234, 179, 8, 0.2)', color: '#fbbf24', border: '1px solid rgba(234, 179, 8, 0.35)', whiteSpace: 'nowrap' }}>
                  Guest ({guestQueryCount}/{MAX_GUEST_QUERIES})
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            <button className="sara-btn-icon" title="Clear Chat History" onClick={clearHistory}>
              <RefreshCw size={13} />
            </button>
            <button className="sara-btn-icon" title="Minimize" onClick={() => setIsMinimized(!isMinimized)}>
              {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
            </button>
            <button className="sara-btn-icon" title="Close" onClick={() => { setIsOpen(false); setIsMinimized(false); }}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Sub Line: Real-Time Date & Model Selector */}
        {!isMinimized && (
          <div className="sara-header-sub" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)' }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
              <span>{liveDateString || 'Online'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)' }}>Model:</span>
              <select
                value={selectedProvider}
                onChange={e => setSelectedProvider(e.target.value)}
                className="sara-provider-select"
                title="Select LLM Engine"
              >
                {PROVIDERS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      {!isMinimized && (
        <>
          <div className="sara-body">
            {/* Capability Welcome Badges (shown on fresh chat) */}
            {messages.length <= 1 && (
              <div className="sara-welcome-tags">
                <div className="capability-tag"><Calendar size={10} /> Real-Time Clock</div>
                <div className="capability-tag"><Cpu size={10} /> Multi-LLM Fleet</div>
                <div className="capability-tag"><Compass size={10} /> 3D Galaxy</div>
                <div className="capability-tag"><FlaskConical size={10} /> Python Wasm</div>
              </div>
            )}
            
            {/* Message Stream */}
            {messages.map((msg, idx) => (
              <div key={idx} className={`sara-message-wrapper ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                {msg.role === 'assistant' && (
                  <div className="sara-avatar-micro">
                    <Sparkles size={11} />
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '100%' }}>
                  <div className={`sara-message ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                    {msg.role === 'assistant' ? (
                      <div className="markdown-body">
                        <ReactMarkdown
                          components={{
                            a: ({ node, ...props }) => (
                              <a {...props} style={{ color: '#818cf8', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer" />
                            ),
                            code: ({ node, inline, className, children, ...props }) => (
                              inline ? (
                                <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 5px', borderRadius: 4, fontFamily: 'monospace', fontSize: '0.82em' }} {...props}>
                                  {children}
                                </code>
                              ) : (
                                <pre style={{ background: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 8, overflowX: 'auto', margin: '8px 0', border: '1px solid rgba(255,255,255,0.1)' }}>
                                  <code style={{ fontFamily: 'monospace', fontSize: '0.8em', color: '#e2e8f0' }} {...props}>
                                    {children}
                                  </code>
                                </pre>
                              )
                            )
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>

                  {/* Motivational Signup Teaser Card for Guests */}
                  {msg.isSignupPrompt && (
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(34, 197, 94, 0.16))',
                      border: '1px solid rgba(99, 102, 241, 0.45)',
                      borderRadius: 12,
                      padding: '14px 16px',
                      marginTop: 8,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.45)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Rocket size={17} style={{ color: '#818cf8' }} />
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>
                          Unlock Unlimited Sara Copilot & Research Engines
                        </span>
                      </div>
                      <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.85)', margin: '0 0 12px 0', lineHeight: 1.45 }}>
                        Create your free RMinios account in 10 seconds to unlock unlimited questions, real-time arXiv paper synthesis, 4-agent Swarm Arena, in-browser Python experiments, and persistent research workspaces.
                      </p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link 
                          href="/signup" 
                          className="btn btn-primary btn-sm" 
                          style={{ fontSize: '0.74rem', padding: '6px 14px', textDecoration: 'none', fontWeight: 600 }}
                        >
                          Create Free Account
                        </Link>
                        <Link 
                          href="/login" 
                          className="btn btn-secondary btn-sm" 
                          style={{ fontSize: '0.74rem', padding: '6px 12px', textDecoration: 'none', background: 'rgba(255,255,255,0.08)' }}
                        >
                          Sign In
                        </Link>
                      </div>
                    </div>
                  )}

                  {msg.role === 'assistant' && msg.provider && (
                    <div className="sara-message-meta">
                      <span className="sara-provider-dot" />
                      <span>{msg.provider}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="sara-message-wrapper assistant">
                <div className="sara-avatar-micro"><Sparkles size={10} /></div>
                <div className="sara-message assistant" style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '12px 16px' }}>
                  <div className="typing-dot" />
                  <div className="typing-dot" style={{ animationDelay: '0.2s' }} />
                  <div className="typing-dot" style={{ animationDelay: '0.4s' }} />
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginLeft: 6 }}>
                    Reasoning with {PROVIDERS.find(p => p.id === selectedProvider)?.name || 'Fleet'}...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips Bar (Docked above input) */}
          {!isGuestExhausted && (
            <div className="sara-quick-bar">
              {QUICK_ACTIONS.map((action, i) => (
                <button
                  key={i}
                  className="sara-quick-chip"
                  onClick={() => sendMessage(action.prompt)}
                  disabled={loading || isGuestExhausted}
                  type="button"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="sara-footer">
            {isGuestExhausted ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 8, padding: '4px 0' }}>
                <span style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.7)' }}>
                  Guest limit reached. Sign up free to continue!
                </span>
                <Link href="/signup" className="btn btn-primary btn-sm" style={{ fontSize: '0.72rem', padding: '4px 12px', textDecoration: 'none' }}>
                  Sign Up Free
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, width: '100%', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={
                    isAuthenticated 
                      ? "Ask Sara anything (date, code, galaxy, sandbox)..." 
                      : `Ask Sara (${MAX_GUEST_QUERIES - guestQueryCount} free questions left)...`
                  }
                  className="sara-input"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || loading} 
                  className="sara-submit-btn"
                  title="Send query"
                >
                  <Send size={15} />
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}
