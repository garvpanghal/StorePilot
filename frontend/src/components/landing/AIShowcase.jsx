import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Sparkles, Send, ArrowRight, User } from 'lucide-react';
import styles from '../../styles/landing.module.css';

export default function AIShowcase() {
  const [activeTab, setActiveTab] = useState('reorder');
  const [typing, setTyping] = useState(false);
  const [showResult, setShowResult] = useState(true);

  // Trigger typing simulation when active tab changes
  useEffect(() => {
    setTyping(true);
    setShowResult(false);
    const timer = setTimeout(() => {
      setTyping(false);
      setShowResult(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const conversations = {
    reorder: {
      question: "Which products should I reorder?",
      response: (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <p style={{ margin: '0 0 10px 0' }}>Based on recent sales velocity and current stock, these products may need replenishment:</p>
          <table className={styles.reorderTable}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Current Stock</th>
                <th>Weekly Sales</th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>🥛 Amul Milk 500ml</strong></td>
                <td>18</td>
                <td>74</td>
                <td><span className={styles.badgeReorder} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>Reorder Now</span></td>
              </tr>
              <tr>
                <td><strong>🌾 Rice 5kg</strong></td>
                <td>11</td>
                <td>43</td>
                <td><span className={styles.badgeReorder} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24' }}>Reorder Soon</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    },
    sales: {
      question: "How were my sales this month?",
      response: (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <p style={{ margin: '0 0 10px 0' }}>Sales are up <strong style={{ color: '#19E68C' }}>12.4%</strong> compared with the previous period.</p>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.78rem', color: 'rgba(248,250,252,0.6)' }}>
            UPI transaction values peaked at 62% of revenue. Standard FMCG dairy rotation metrics are performing above limits.
          </p>
        </div>
      )
    },
    margins: {
      question: "Are any margins falling?",
      response: (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <p style={{ margin: '0 0 10px 0' }}>Yes, Wheat Atta 5kg margins compressed by <strong style={{ color: '#f87171' }}>5%</strong> due to supplier cost increases.</p>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(248,250,252,0.6)' }}>
            Recommend updating retail POS rates or negotiating pricing offsets with vendor.
          </p>
        </div>
      )
    }
  };

  return (
    <section className={styles.aiSection}>
      <div className={styles.container}>
        <div className={styles.aiSectionGrid}>
          {/* Left Column: Info & Buttons */}
          <div className={styles.aiLeft}>
            <div className={styles.badge} style={{ width: 'fit-content' }}>
              <Bot size={13} />
              StorePilot AI Engine
            </div>
            <h2 className={styles.aiLeftTitle}>
              <span>Don't just manage.</span>
              <span className={styles.heroTitleHighlight}>Ask your store.</span>
            </h2>
            <p className={styles.aiLeftDesc}>
              StorePilot AI turns your business database records into immediate, actionable answers.
            </p>
            <Link to="/login" className={styles.trialBtn} style={{ background: '#8B5CF6', color: '#fff', width: 'fit-content' }}>
              Try AI Assistant <Sparkles size={14} style={{ marginLeft: 6 }} />
            </Link>
          </div>

          {/* Right Column: Chatbot simulation */}
          <div className={styles.aiChatBox}>
            {/* Header */}
            <div className={styles.chatHeader}>
              <Bot size={18} style={{ color: '#8B5CF6' }} />
              <span className={styles.chatHeaderTitle} style={{ color: '#F8FAFC' }}>StorePilot AI Assistant</span>
              <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#19E68C' }}></span>
            </div>

            {/* Selector buttons */}
            <div className={styles.chatSelector}>
              <button 
                className={`${styles.chatSelectorBtn} ${activeTab === 'reorder' ? styles.chatSelectorBtnActive : ''}`}
                onClick={() => setActiveTab('reorder')}
              >
                Reorders?
              </button>
              <button 
                className={`${styles.chatSelectorBtn} ${activeTab === 'sales' ? styles.chatSelectorBtnActive : ''}`}
                onClick={() => setActiveTab('sales')}
              >
                Monthly Sales?
              </button>
              <button 
                className={`${styles.chatSelectorBtn} ${activeTab === 'margins' ? styles.chatSelectorBtnActive : ''}`}
                onClick={() => setActiveTab('margins')}
              >
                Margins?
              </button>
            </div>

            {/* Conversation Flow */}
            <div className={styles.aiChatMessages}>
              {/* User question */}
              <div className={styles.msgUser} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={13} /> {conversations[activeTab].question}
              </div>

              {/* AI response */}
              {typing ? (
                <div className={styles.msgAi} style={{ display: 'flex', alignItems: 'center', padding: '14px 20px' }}>
                  <div className={styles.typingIndicator}>
                    <span></span><span></span><span></span>
                  </div>
                </div>
              ) : (
                showResult && (
                  <div className={styles.msgAi} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8B5CF6', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>
                      <Sparkles size={12} />
                      AI Recommendation
                    </div>
                    {conversations[activeTab].response}
                  </div>
                )
              )}
            </div>

            <div className={styles.chatInputArea}>
              <input className={styles.chatInput} placeholder="Type pricing, sales velocity questions..." readOnly />
              <button className={styles.chatSendBtn} disabled aria-label="Send">
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
