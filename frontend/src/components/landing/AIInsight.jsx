import React from 'react';
import { Bot, Sparkles, ArrowRight } from 'lucide-react';
import styles from '../../styles/landing.module.css';

export default function AIInsight({ active, onClickNotification }) {
  return (
    <div className={styles.orbWrapper}>
      {/* AI Floating notification */}
      <div 
        className={styles.aiNotification}
        style={{ opacity: active ? 1 : 0, transform: active ? 'scale(1)' : 'scale(0.9)', transition: 'all 0.3s ease' }}
      >
        <div className={styles.aiNotificationTitle}>
          <Bot size={13} />
          StorePilot AI ✦
        </div>
        <div className={styles.aiNotificationDesc}>
          3 products are low in stock and may need immediate replenishment.
        </div>
        <button 
          onClick={onClickNotification} 
          className={styles.aiNotificationLink}
          style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
        >
          View AI Insights <ArrowRight size={12} />
        </button>
      </div>

      {/* Floating Orb Avatar */}
      <div className={`${styles.aiOrb} ${active ? styles.aiOrbActive : ''}`}>
        <Bot size={22} style={{ color: '#fff' }} />
      </div>
    </div>
  );
}
