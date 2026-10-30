'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Send, X, Minimize2, Maximize2, Sparkles, Server, BarChart, 
  FileText, RefreshCw, Calendar, Cpu, Compass, FlaskConical, 
  Mic, ShieldCheck, Rocket, ChevronDown
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { createClient } from '@/lib/supabase/client';
import { useDynamicIsland } from '@/context/DynamicIslandContext';

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
  { id: 'google', name: 'Gemini 3.5 Flash', tag: 'Fast & Deep' },
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
  const [selectedProvider, setSelectedProvider] = useState('google');
  const [liveDateString, setLiveDateString] = useState('');
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Hello! I am Sara, your Principal AI Solutions Architect & Autonomous Research Copilot. I have full real-time clock awareness and deep command over all 52 RMinios research engines. How can I assist your discovery today?',
      provider: 'Gemini 3.5 Flash'
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

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
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
        provider: 'Gemini 3.5 Flash'
      }]);
    }
  }, [userId]);

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
      
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.reply,
          provider: data.providerUsed || 'RMinios Fleet',
          timestamp: data.timestamp
        }]);
        showNotification({
          title: 'Sara Copilot Synthesized',
          message: `Answer ready via ${data.providerUsed || 'RMinios Fleet'}`,
          icon: <Sparkles size={16} />,
          type: 'purple'
        });
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.reply || '⚠️ System Error: Unable to connect to orchestration layer.',
          provider: 'Error Guard'
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '⚠️ Network Error: Orchestration layer unreachable. Please check connection.',
        provider: 'Network Error'
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
      provider: 'Gemini 3.5 Flash'
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

  return (
    <div className={`sara-window ${isMinimized ? 'minimized' : ''}`}>
      {/* Header */}
      <div className="sara-header" onClick={() => setIsMinimized(!isMinimized)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          <div className="sara-avatar-mini">
            <div className="sara-orb-core-mini" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: '#fff' }}>
                Sara Copilot
              </h3>
              <span className="badge badge-accent" style={{ fontSize: '0.58rem', padding: '1px 5px' }}>v3.0</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
              <span>{liveDateString || 'Online'}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Provider selector */}
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
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

          <button className="sara-btn-icon" title="Clear Chat History" onClick={clearHistory}>
            <RefreshCw size={13} />
          </button>
          <button className="sara-btn-icon" title="Minimize" onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}>
            {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
          </button>
          <button className="sara-btn-icon" title="Close" onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsMinimized(false); }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <>
          <div className="sara-body">
            {/* Capability Pills */}
            <div className="sara-capabilities">
              <div className="capability-tag"><Calendar size={10} /> Real-Time Clock</div>
              <div className="capability-tag"><Cpu size={10} /> Multi-LLM Fleet</div>
              <div className="capability-tag"><Compass size={10} /> 3D Galaxy</div>
              <div className="capability-tag"><FlaskConical size={10} /> Python Wasm</div>
            </div>

            {/* Quick Actions Carousel */}
            <div className="sara-quick-actions">
              {QUICK_ACTIONS.map((action, i) => (
                <button
                  key={i}
                  className="sara-quick-chip"
                  onClick={() => sendMessage(action.prompt)}
                  disabled={loading}
                >
                  {action.label}
                </button>
              ))}
            </div>
            
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

          {/* Input Footer */}
          <div className="sara-footer">
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, width: '100%', alignItems: 'center' }}>
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask Sara anything (date, code, galaxy, sandbox)..."
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
          </div>
        </>
      )}
    </div>
  );
}
