'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Send, Loader, BookOpen, Plus, Trash2, Mic, MicOff, Edit2, Copy, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatTab({ workspaceId }) {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [streaming, setStreaming] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const supabase = createClient();

  useEffect(() => { loadConversations(); }, [workspaceId]);
  useEffect(() => { if (activeConv) loadMessages(activeConv); }, [activeConv]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, streaming]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setInput(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  async function loadConversations() {
    const { data } = await supabase.from('conversations').select('*').eq('workspace_id', workspaceId).order('updated_at', { ascending: false });
    setConversations(data || []);
    if (data?.length > 0 && !activeConv) setActiveConv(data[0].id);
  }

  async function loadMessages(convId) {
    const { data } = await supabase.from('messages').select('*').eq('conversation_id', convId).order('created_at', { ascending: true });
    setMessages(data || []);
  }

  async function createConversation() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('conversations').insert({ workspace_id: workspaceId, user_id: user.id, title: 'New Chat' }).select().single();
    if (data) { setConversations(prev => [data, ...prev]); setActiveConv(data.id); setMessages([]); }
  }

  async function deleteConversation(convId) {
    await supabase.from('messages').delete().eq('conversation_id', convId);
    await supabase.from('conversations').delete().eq('id', convId);
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (activeConv === convId) { setActiveConv(null); setMessages([]); }
  }

  async function sendMessage(e, customInput = null) {
    if (e) e.preventDefault();
    const textToSend = customInput || input;
    if (!textToSend.trim() || sending) return;

    let convId = activeConv;
    if (!convId) {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from('conversations').insert({ workspace_id: workspaceId, user_id: user.id, title: textToSend.slice(0, 50) }).select().single();
      if (data) { convId = data.id; setActiveConv(data.id); setConversations(prev => [data, ...prev]); }
    }

    const userMsg = { role: 'user', content: textToSend, conversation_id: convId };
    await supabase.from('messages').insert(userMsg);
    setMessages(prev => [...prev, { ...userMsg, id: Date.now(), created_at: new Date().toISOString() }]);
    
    // Only clear input if we were using the main input box
    if (!customInput) setInput('');
    setSending(true);
    setStreaming('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, workspaceId, conversationId: convId, history: messages.slice(-6) }),
      });

      if (!res.ok) throw new Error('Chat failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreaming(fullText);
      }

      const assistantMsg = { role: 'assistant', content: fullText, conversation_id: convId };
      await supabase.from('messages').insert(assistantMsg);
      setMessages(prev => [...prev, { ...assistantMsg, id: Date.now() + 1, created_at: new Date().toISOString() }]);
      setStreaming('');

      if (messages.length === 0) {
        await supabase.from('conversations').update({ title: textToSend.slice(0, 60) }).eq('id', convId);
        loadConversations();
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: 'Sorry, something went wrong. Please try again.', created_at: new Date().toISOString() }]);
    }

    setSending(false);
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const editMessage = (text) => {
    setInput(text);
    textareaRef.current?.focus();
  };

  const retryMessage = (text) => {
    setInput(text);
    sendMessage(null, text);
  };

  const quickPrompts = [
    'Summarize all uploaded papers',
    'What methodologies are used most often?',
    'What are the key findings across papers?',
    'Generate a literature review',
    'Identify research gaps',
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 0, flex: 1, minHeight: 0, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      {/* Conversation Sidebar */}
      <div style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)' }}>
        <div style={{ padding: 12 }}>
          <button className="btn btn-primary btn-sm w-full" onClick={createConversation}>
            <Plus size={14} /> New Chat
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
          {conversations.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                className={`sidebar-link ${activeConv === c.id ? 'active' : ''}`}
                onClick={() => setActiveConv(c.id)}
                style={{ flex: 1, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                <BookOpen size={14} style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</span>
              </button>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => deleteConversation(c.id)} style={{ flexShrink: 0, width: 28, height: 28, padding: 4 }}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-container" style={{ height: '100%' }}>
        <div className="chat-messages">
          {messages.length === 0 && !streaming && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
              <div style={{ fontSize: '2.5rem' }}>💬</div>
              <h3 style={{ color: 'var(--text-secondary)' }}>Chat with your papers</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', maxWidth: 400 }}>Ask questions about your uploaded research papers. The AI will answer using your documents as context.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 500 }}>
                {quickPrompts.map((p, i) => (
                  <button key={i} className="btn btn-secondary btn-sm" onClick={() => setInput(p)} style={{ fontSize: '0.75rem' }}>{p}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`message-wrapper ${msg.role === 'user' ? 'wrapper-user' : 'wrapper-assistant'}`}>
              <div className={`message ${msg.role === 'user' ? 'message-user' : 'message-assistant'}`}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                ) : msg.content}
              </div>
              
              <div className="message-actions">
                <button className="btn btn-icon btn-ghost btn-sm" onClick={() => copyToClipboard(msg.content)} title="Copy" style={{ width: 24, height: 24, padding: 0 }}>
                  <Copy size={12} />
                </button>
                {msg.role === 'user' && (
                  <>
                    <button className="btn btn-icon btn-ghost btn-sm" onClick={() => editMessage(msg.content)} title="Edit" style={{ width: 24, height: 24, padding: 0 }}>
                      <Edit2 size={12} />
                    </button>
                    <button className="btn btn-icon btn-ghost btn-sm" onClick={() => retryMessage(msg.content)} title="Retry" style={{ width: 24, height: 24, padding: 0 }}>
                      <RotateCcw size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {streaming && (
            <div className="message-wrapper wrapper-assistant">
              <div className="message message-assistant">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{streaming}</ReactMarkdown>
                <span className="spinner" style={{ marginTop: 8 }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <form onSubmit={sendMessage} className="chat-input-wrapper">
            <button 
              type="button"
              className={`btn btn-icon btn-sm ${isListening ? 'btn-danger' : 'btn-ghost'}`}
              onClick={toggleListening}
              title="Dictate message"
              disabled={sending}
              style={{ flexShrink: 0, marginBottom: 4 }}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <textarea
              ref={textareaRef}
              className="chat-input"
              placeholder={isListening ? "Listening..." : "Ask about your papers..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={sending}
            />
            <button type="submit" className="chat-send-btn" disabled={sending || !input.trim()} style={{ marginBottom: 4 }}>
              {sending ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
