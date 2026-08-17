import React, { useState } from 'react';
import { ArrowRight, Sparkles, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import styles from '../../styles/landing.module.css';

export default function DataInsightSection() {
  const [activePoint, setActivePoint] = useState(1);

  const points = [
    { 
      id: 0, 
      label: 'Week 1', 
      title: 'Stable Operational Baseline', 
      desc: 'Category rotation rates are matching historical averages. Stock levels remain healthy across top divisions.', 
      badge: 'Normal volume', 
      cx: 50, cy: 110,
      impact: 'No immediate reorder adjustments required.' 
    },
    { 
      id: 1, 
      label: 'Week 2', 
      title: 'Milk Sales Increased 18% This Week', 
      desc: 'FMCG dairy speed has surged beyond weekly limits. If current velocity holds, out-of-stock states will occur in 48 hours.', 
      badge: 'Demand Surge', 
      cx: 150, cy: 60,
      impact: 'Your fastest-moving products may need earlier replenishment.' 
    },
    { 
      id: 2, 
      label: 'Week 3', 
      title: 'Wheat Atta Margin Compressed by 5%', 
      desc: 'Vendor supply cost increased by ₹12 per unit, while POS pricing remained unchanged.', 
      badge: 'Margin warning', 
      cx: 250, cy: 90,
      impact: 'Check supplier procurement agreements or adjust POS retail rates.' 
    },
    { 
      id: 3, 
      label: 'Week 4', 
      title: 'UPI billing transactions peaked at 62%', 
      desc: 'Digital checkouts have surpassed traditional cash receipts. Transaction velocities remain optimal.', 
      badge: 'Billing peak', 
      cx: 350, cy: 30,
      impact: 'Ensure bank settlements match POS invoice reports.' 
    }
  ];

  const current = points.find(p => p.id === activePoint) || points[1];

  return (
    <section className={styles.lightSection} style={{ borderTop: '1px solid rgba(15, 23, 42, 0.06)' }}>
      <div className={styles.container}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className={styles.lightEyebrow}>Data Intelligence</div>
          <h2 className={styles.sectionTitle}>
            Numbers are useful. <span className={styles.sectionTitleHighlight}>Understanding them is better.</span>
          </h2>
          <p className={styles.sectionDesc}>
            StorePilot doesn't merely log logs. It interprets transaction spikes and flags margin leaks automatically.
          </p>
        </div>

        <div className={styles.insightSplit}>
          {/* Left Side: Interactive SVG Chart */}
          <div className={styles.insightLeft}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>Interactive Sales Velocity</strong>
              <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Click dots to explore insights <Sparkles size={12} style={{ color: '#13a66a' }} />
              </span>
            </div>

            <div className={styles.chartContainer}>
              <svg viewBox="0 0 400 150" className={styles.svgChart}>
                {/* Connector grid lines */}
                <line x1="10" y1="130" x2="390" y2="130" stroke="rgba(15,23,42,0.06)" />
                <line x1="10" y1="80" x2="390" y2="80" stroke="rgba(15,23,42,0.06)" />
                <line x1="10" y1="30" x2="390" y2="30" stroke="rgba(15,23,42,0.06)" />

                {/* SVG trend path */}
                <path
                  d="M 50 110 L 150 60 L 250 90 L 350 30"
                  fill="none"
                  stroke="#13a66a"
                  strokeWidth="3.5"
                  className={styles.chartPath}
                />

                {/* Dots to select */}
                {points.map(p => (
                  <circle
                    key={p.id}
                    cx={p.cx}
                    cy={p.cy}
                    r={activePoint === p.id ? 7 : 5}
                    className={`${styles.chartDot} ${activePoint === p.id ? styles.chartDotActive : ''}`}
                    onClick={() => setActivePoint(p.id)}
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* Right Side: Dynamic Insight Presentation Box */}
          <div>
            <div className={styles.insightCard}>
              <div className={styles.insightCardHeader}>
                <TrendingUp size={14} />
                {current.badge}
              </div>
              <h3 className={styles.insightCardTitle}>{current.title}</h3>
              <p className={styles.insightCardDesc}>{current.desc}</p>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                <Sparkles size={16} style={{ color: '#19E68C', flex: 'none', marginTop: '2px' }} />
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#19E68C', fontWeight: 600 }}>
                  {current.impact}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
