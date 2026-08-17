import React from 'react';
import { TrendingUp, Activity, BarChart2 } from 'lucide-react';
import styles from '../../styles/landing.module.css';

export default function IntelligenceSection() {
  return (
    <section className={styles.lightSection} style={{ borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}>
      <div className={styles.container}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className={styles.lightEyebrow}>Product Intelligence</div>
          <h2 className={styles.sectionTitle}>
            See what your store <span className={styles.sectionTitleHighlight}>is telling you.</span>
          </h2>
          <p className={styles.sectionDesc} style={{ margin: '0 auto' }}>
            StorePilot doesn't just store logs. It translates raw transactions into actionable operational growth metrics.
          </p>
        </div>

        <div className={styles.intelGrid}>
          {/* Card 1: Sales trends */}
          <div className={styles.intelCard}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span className={styles.watchBtnIcon} style={{ background: 'rgba(25, 230, 140, 0.08)', color: '#13a66a', border: '1px solid rgba(25, 230, 140, 0.2)' }}>
                  <TrendingUp size={16} />
                </span>
                <h3 className={styles.intelTitle}>Sales & Growth Analytics</h3>
              </div>
              <p className={styles.intelDesc}>
                Identify active purchase intervals, peek high-margin periods, and review month-over-month performance trends.
              </p>
            </div>

            <div className={styles.intelChart}>
              <svg viewBox="0 0 400 150" style={{ width: '100%', height: '100%' }}>
                <path
                  d="M 10 130 C 50 110, 80 50, 120 70 C 160 90, 200 20, 240 40 C 280 60, 320 10, 390 10"
                  fill="none"
                  stroke="#13a66a"
                  strokeWidth="3"
                  className={styles.chartPath}
                />
                <path
                  d="M 10 130 C 50 110, 80 50, 120 70 C 160 90, 200 20, 240 40 C 280 60, 320 10, 390 10 L 390 150 L 10 150 Z"
                  fill="url(#chartFade)"
                  opacity="0.1"
                />
                <defs>
                  <linearGradient id="chartFade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#19E68C" />
                    <stop offset="100%" stopColor="#19E68C" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="10" y1="130" x2="390" y2="130" stroke="rgba(0,0,0,0.06)" strokeDasharray="4" />
                <line x1="10" y1="80" x2="390" y2="80" stroke="rgba(0,0,0,0.06)" strokeDasharray="4" />
                <line x1="10" y1="30" x2="390" y2="30" stroke="rgba(0,0,0,0.06)" strokeDasharray="4" />
              </svg>
            </div>
          </div>

          {/* Card 2: Inventory Status */}
          <div className={styles.intelCard}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span className={styles.watchBtnIcon} style={{ background: 'rgba(139, 92, 246, 0.08)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                  <Activity size={16} />
                </span>
                <h3 className={styles.intelTitle}>Stock Rotation & Valuation</h3>
              </div>
              <p className={styles.intelDesc}>
                Avoid overstock fees or out-of-stock deficits with intelligent warning indicators for category inventories.
              </p>
            </div>

            <div className={styles.intelChart}>
              <svg viewBox="0 0 400 150" style={{ width: '100%', height: '100%' }}>
                {/* SVG bar chart */}
                <rect x="30" y="40" width="30" height="110" fill="#8B5CF6" rx="4" style={{ '--h': '110px', '--y': '40px' }} className={styles.barPath} />
                <rect x="90" y="60" width="30" height="90" fill="#a855f7" rx="4" style={{ '--h': '90px', '--y': '60px' }} className={styles.barPath} />
                <rect x="150" y="20" width="30" height="130" fill="#c084fc" rx="4" style={{ '--h': '130px', '--y': '20px' }} className={styles.barPath} />
                <rect x="210" y="80" width="30" height="70" fill="#8B5CF6" rx="4" style={{ '--h': '70px', '--y': '80px' }} className={styles.barPath} />
                <rect x="270" y="50" width="30" height="100" fill="#19E68C" rx="4" style={{ '--h': '100px', '--y': '50px' }} className={styles.barPath} />
                <rect x="330" y="10" width="30" height="140" fill="#13a66a" rx="4" style={{ '--h': '140px', '--y': '10px' }} className={styles.barPath} />
                <line x1="0" y1="150" x2="400" y2="150" stroke="rgba(0,0,0,0.1)" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
