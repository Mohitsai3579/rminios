'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, Minimize2, Maximize2, Sparkles, Server, BarChart, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { createClient } from '@/lib/supabase/client';

export default function SaraAssistant() {
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [userId, setUserId] = useState('visitor');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am Sara, your Enterprise AI Architect and Copilot. How can I assist you with your research or system operations today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, [supabase]);

  useEffect(() => {
    const saved = localStorage.getItem(`sara_history_${userId}`);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch(e) {}
    } else {
      setMessages([{ role: 'assistant', content: 'Hello! I am Sara, your Enterprise AI Architect and Copilot. How can I assist you with your research or system operations today?' }]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/sara', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: messages })
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ System Error: Unable to connect to orchestration layer.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Network Error: Orchestration layer unreachable.' }]);
    }
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="sara-orb"
        title="Wake Sara"
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="sara-avatar-mini">
            <div className="sara-orb-core-mini" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              Sara OS <span className="badge badge-accent" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>v2.0</span>
            </h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Agentic Orchestrator Online</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="sara-btn-icon" onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}>
            {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
          <button className="sara-btn-icon" onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsMinimized(false); }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <>
          <div className="sara-body">
            <div className="sara-capabilities">
              <div className="capability-tag"><Server size={10} /> Architecture Copilot</div>
              <div className="capability-tag"><BarChart size={10} /> Admin Analytics</div>
              <div className="capability-tag"><FileText size={10} /> RAG Router</div>
            </div>
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`sara-message-wrapper ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                {msg.role === 'assistant' && (
                  <div className="sara-avatar-micro">
                    <Sparkles size={10} />
                  </div>
                )}
                <div className={`sara-message ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                  {msg.role === 'assistant' ? (
                    <div className="markdown-body">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="sara-message-wrapper assistant">
                <div className="sara-avatar-micro"><Sparkles size={10} /></div>
                <div className="sara-message assistant" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <div className="typing-dot" />
                  <div className="typing-dot" style={{ animationDelay: '0.2s' }} />
                  <div className="typing-dot" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="sara-footer">
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, width: '100%' }}>
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask Sara to route a task or query data..."
                className="sara-input"
              />
              <button type="submit" disabled={!input.trim() || loading} className="sara-submit-btn">
                <Send size={16} />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
