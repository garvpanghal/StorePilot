import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Sparkles, HelpCircle, Check, Send } from 'lucide-react';
import styles from '../../styles/landing.module.css';

export default function AIInsightsSection() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Loop steps of the AI chat animation
    const interval = setInterval(() => {
      setStep(prev => (prev + 1) % 5);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="solutions" className={styles.darkSection} style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
      <div className={styles.container}>
        <div className={styles.aiSectionGrid}>
          {/* Left info column */}
          <div>
            <div className={styles.badge} style={{ width: 'fit-content' }}>
              <Bot size={13} />
              StorePilot AI
            </div>
            <h2 className={styles.heroTitle} style={{ fontSize: '2.8rem', marginBottom: '16px' }}>
              <span>Insights that</span>
              <span style={{ color: '#a855f7' }}>think ahead.</span>
            </h2>
            <p className={styles.heroDesc}>
              Ask anything about your business and get instant, actionable answers.
            </p>
            <Link to="/login" className={styles.trialBtn} style={{ background: '#8B5CF6', color: '#fff', width: 'fit-content' }}>
              Try AI Assistant <Sparkles size={14} style={{ marginLeft: 6 }} />
            </Link>
          </div>

          {/* Interactive Chat Visualization */}
          <div className={styles.aiChatCard}>
            <div className={styles.chatHeader}>
              <div className={styles.chatLogo}>
                <Bot size={14} style={{ color: '#fff' }} />
              </div>
              <span className={styles.chatHeaderTitle}>StorePilot AI Assistant</span>
              <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#19E68C' }}></span>
            </div>

            <div className={styles.chatMessages}>
              {/* Step 1: User message */}
              {step >= 1 && (
                <div className={styles.msgUser}>
                  Which products are selling fast this week?
                </div>
              )}

              {/* Step 2: Typing indicator */}
              {step === 2 && (
                <div className={styles.msgAi} style={{ display: 'flex', alignItems: 'center' }}>
                  <div className={styles.typingIndicator}>
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}

              {/* Step 3 & 4: AI responses */}
              {step >= 3 && (
                <div className={styles.msgAi}>
                  <p style={{ margin: '0 0 10px 0', fontWeight: 600, color: '#19E68C' }}>
                    Here are your top selling products this week:
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 10px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>🥛 Amul Milk 500ml</span>
                      <strong>230 units <span style={{ color: '#19E68C', fontSize: '0.75rem' }}>↑ 18%</span></strong>
                    </li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>🌾 Rice 5kg</span>
                      <strong>120 units <span style={{ color: '#19E68C', fontSize: '0.75rem' }}>↑ 12%</span></strong>
                    </li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>🍪 Wheat Atta 5kg</span>
                      <strong>90 units <span style={{ color: '#19E68C', fontSize: '0.75rem' }}>↑ 9%</span></strong>
                    </li>
                  </ul>
                  {step >= 4 && (
                    <p style={{ margin: 0, color: 'rgba(248, 250, 252, 0.6)', fontSize: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 8 }}>
                      Overall sales are up 12.4% compared to last week.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className={styles.chatInputArea}>
              <input className={styles.chatInput} placeholder="Ask about sales, stock status..." readOnly />
              <button className={styles.chatSendBtn} disabled aria-label="Send">
                <Send size={15} />
              </button>
            </div>
          </div>

          {/* Right Column: AI details checklist */}
          <div className={styles.aiFeatureList}>
            <div className={styles.aiFeatureItem}>
              <div className={styles.aiFeatureIcon}>
                <HelpCircle size={20} />
              </div>
              <div className={styles.aiFeatureMeta}>
                <h3>Ask Questions</h3>
                <p>Get answers about sales forecasts, active inventory valuation and category margins instantly.</p>
              </div>
            </div>
            <div className={styles.aiFeatureItem}>
              <div className={styles.aiFeatureIcon}>
                <Sparkles size={20} />
              </div>
              <div className={styles.aiFeatureMeta}>
                <h3>Smart Recommendations</h3>
                <p>Receive AI-driven reorder level notifications so you never run out of top-selling stock items.</p>
              </div>
            </div>
            <div className={styles.aiFeatureItem}>
              <div className={styles.aiFeatureIcon}>
                <Check size={20} />
              </div>
              <div className={styles.aiFeatureMeta}>
                <h3>Save Time</h3>
                <p>Automate spreadsheet generation and let StorePilot summarize key business metrics.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
