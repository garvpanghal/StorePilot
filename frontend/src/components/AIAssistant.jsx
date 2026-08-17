import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, MessageCircle, Maximize2, Minimize2, ArrowLeft } from 'lucide-react';
import { aiAPI } from '../api/api';
import styles from '../styles/ai-assistant.module.css';

const SUGGESTIONS = [
  'Which products should I reorder?',
  'Show me products at risk of dead stock',
  'What were my sales yesterday?',
  'Which products are expiring soon?',
  'Why is my profit down this month?',
];

export default function AIAssistant({ isOpen, onClose, mode }) {
  // mode: 'desktop' | 'mobile'
  const [fullscreen, setFullscreen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(true);
  const panelRef = useRef(null);
  const previousFocus = useRef(null);
  const messagesEndRef = useRef(null);

  // Check AI provider status on mount
  useEffect(() => {
    aiAPI.status()
      .then(res => setAiAvailable(res.available))
      .catch(() => setAiAvailable(false));
  }, []);

  // Store the element that opened the panel so we can restore focus
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement;
      // Small delay to let the panel render before focusing
      const t = setTimeout(() => {
        if (panelRef.current) panelRef.current.focus();
      }, 50);
      return () => clearTimeout(t);
    } else {
      setFullscreen(false);
      if (previousFocus.current && typeof previousFocus.current.focus === 'function') {
        previousFocus.current.focus();
      }
    }
  }, [isOpen]);

  // Escape handler
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (fullscreen) {
          setFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, fullscreen, onClose]);

  // Mobile fullscreen: prevent body scroll
  useEffect(() => {
    if (mode === 'mobile' && fullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mode, fullscreen]);

  // Auto-scroll messages to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleClose = useCallback(() => {
    if (fullscreen) {
      setFullscreen(false);
    } else {
      onClose();
    }
  }, [fullscreen, onClose]);

  const handleSendMessage = async (text) => {
    const query = text || inputValue;
    if (!query.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: query }]);
    setInputValue('');
    setLoading(true);

    try {
      const res = await aiAPI.chat(query);
      setMessages(prev => [...prev, { sender: 'assistant', text: res.response }]);
      setAiAvailable(res.ai_available);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: "I encountered an error communicating with the AI server. Please make sure the backend is running and GEMINI_API_KEY is configured in your .env file."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const clearChat = () => {
    setMessages([]);
  };

  if (!isOpen && mode !== 'desktop') return null;

  const renderContent = () => {
    if (messages.length === 0) {
      return (
        <>
          <div className={styles.avatar}>
            <div className={styles.avatarIcon} aria-hidden="true">✦</div>
            <h2 className={styles.avatarTitle}>Hello! I'm StorePilot AI</h2>
            <p className={styles.avatarDesc}>
              {aiAvailable 
                ? "Your intelligent store assistant. Ask me anything about your inventory, sales, or recommendations." 
                : "AI is currently unavailable. Please configure your GEMINI_API_KEY in the backend .env file to enable assistant features."
              }
            </p>
          </div>
          <div className={styles.suggestions}>
            {SUGGESTIONS.map(q => (
              <button key={q} className={styles.suggestionBtn} onClick={() => handleSuggestionClick(q)} disabled={!aiAvailable}>
                <MessageCircle size={13} />
                <span>{q}</span>
              </button>
            ))}
          </div>
        </>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              background: msg.sender === 'user' ? 'var(--primary)' : 'color-mix(in srgb, var(--purple) 8%, transparent)',
              color: msg.sender === 'user' ? 'var(--bg)' : 'var(--text)',
              border: msg.sender === 'user' ? '0' : '1px solid color-mix(in srgb, var(--purple) 20%, transparent)',
              padding: '10px 14px',
              borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
              maxWidth: '85%',
              fontSize: '0.84rem',
              lineHeight: '1.4',
              whiteSpace: 'pre-wrap',
            }}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div 
            style={{
              alignSelf: 'flex-start',
              background: 'var(--surface2)',
              color: 'var(--muted)',
              padding: '10px 14px',
              borderRadius: '14px 14px 14px 2px',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <div className="spinner" style={{ width: '12px', height: '12px', borderWidth: '1.5px' }} />
            <span>StorePilot is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    );
  };

  // ─── Desktop integrated panel ───
  if (mode === 'desktop') {
    return (
      <aside
        ref={panelRef}
        className={`${styles.desktopPanel} ${isOpen ? styles.desktopPanelOpen : ''}`}
        role="complementary"
        aria-label="AI Assistant"
        tabIndex={-1}
      >
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <span className={styles.sparkle} aria-hidden="true">✦</span>
            <strong>AI Assistant</strong>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {messages.length > 0 && (
              <button 
                onClick={clearChat} 
                style={{ border: 'none', background: 'transparent', color: 'var(--muted)', fontSize: '0.78rem', cursor: 'pointer', padding: '0 8px', fontWeight: 600 }}
              >
                Clear
              </button>
            )}
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close AI Assistant">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className={styles.body}>
          {renderContent()}
        </div>
        <div className={styles.footer}>
          <div className={styles.inputBar}>
            <input 
              placeholder="Type your question here..." 
              aria-label="Ask AI Assistant"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              disabled={loading || !aiAvailable}
            />
            <button className={styles.sendBtn} aria-label="Send message" onClick={() => handleSendMessage()} disabled={loading || !aiAvailable}>
              <Send size={15} />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // ─── Mobile floating / fullscreen ───
  return (
    <>
      {/* Backdrop for floating agent — tapping outside closes */}
      {!fullscreen && <div className={styles.mobileBackdrop} onClick={onClose} aria-hidden="true" />}

      <div
        ref={panelRef}
        className={`${styles.mobileAgent} ${fullscreen ? styles.mobileFullscreen : ''}`}
        role="dialog"
        aria-modal={fullscreen ? 'true' : undefined}
        aria-label="AI Assistant"
        tabIndex={-1}
      >
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            {fullscreen && (
              <button className={styles.backBtn} onClick={() => setFullscreen(false)} aria-label="Exit fullscreen">
                <ArrowLeft size={18} />
              </button>
            )}
            <span className={styles.sparkle} aria-hidden="true">✦</span>
            <strong>AI Assistant</strong>
          </div>
          <div className={styles.headerActions}>
            {messages.length > 0 && (
              <button 
                onClick={clearChat} 
                style={{ border: 'none', background: 'transparent', color: 'var(--muted)', fontSize: '0.78rem', cursor: 'pointer', padding: '0 8px', fontWeight: 600 }}
              >
                Clear
              </button>
            )}
            <button
              className={styles.expandBtn}
              onClick={() => setFullscreen(f => !f)}
              aria-label={fullscreen ? 'Exit fullscreen' : 'Expand to fullscreen'}
            >
              {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button className={styles.closeBtn} onClick={handleClose} aria-label="Close AI Assistant">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className={styles.body}>
          {renderContent()}
        </div>
        <div className={styles.footer}>
          <div className={styles.inputBar}>
            <input 
              placeholder="Type your question here..." 
              aria-label="Ask AI Assistant"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              disabled={loading || !aiAvailable}
            />
            <button className={styles.sendBtn} aria-label="Send message" onClick={() => handleSendMessage()} disabled={loading || !aiAvailable}>
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
