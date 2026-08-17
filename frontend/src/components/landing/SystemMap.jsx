import React, { useState } from 'react';
import { Package, ShoppingCart, Truck, BarChart3, Bot, Sparkles } from 'lucide-react';
import styles from '../../styles/landing.module.css';

export default function SystemMap() {
  const [activeNode, setActiveNode] = useState(null);

  const nodes = [
    { id: 'inventory', title: 'Inventory', desc: 'Real-time stock tracking', icon: <Package size={18} />, color: '#19E68C', bg: 'rgba(25, 230, 140, 0.06)', border: 'rgba(25, 230, 140, 0.15)', className: styles.node1, x: '24%', y: '23%', text: 'Stock counts update automatically as sales occur or shipments arrive.' },
    { id: 'sales', title: 'Sales POS', desc: 'Fast client checkouts', icon: <ShoppingCart size={18} />, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.06)', border: 'rgba(59, 130, 246, 0.15)', className: styles.node2, x: '76%', y: '23%', text: 'POS transactions feed direct invoice updates to billing ledgers.' },
    { id: 'purchases', title: 'Purchases', desc: 'Procurement ledgers', icon: <Truck size={18} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.06)', border: 'rgba(245, 158, 11, 0.15)', className: styles.node3, x: '21%', y: '58%', text: 'Raise supplier purchase orders to automatically increment stock upon arrival.' },
    { id: 'reports', title: 'Analytics', desc: 'Financial summaries', icon: <BarChart3 size={18} />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.06)', border: 'rgba(239, 68, 68, 0.15)', className: styles.node4, x: '79%', y: '58%', text: 'Consolidate P&L sheets and category performance margins cleanly.' },
    { id: 'ai', title: 'AI Assistant', desc: 'Forecast suggestions', icon: <Bot size={18} />, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.06)', border: 'rgba(139, 92, 246, 0.15)', className: styles.node5, x: '50%', y: '84%', text: 'Ask about velocity trends or margins for actionable store advice.' },
  ];

  return (
    <section id="about" className={styles.lightSection} style={{ borderTop: '1px solid rgba(15, 23, 42, 0.06)' }}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionEyebrow}>Ecosystem Connectivity</div>
          <h2 className={styles.sectionTitle}>
            One system. <span className={styles.sectionTitleHighlight}>Every operation.</span>
          </h2>
          <p className={styles.sectionDesc}>
            StorePilot brings inventory, sales, purchases and reporting into one connected workspace.
          </p>
        </div>

        <div className={styles.ecoWrap}>
          {/* SVG Connection Lines */}
          <svg className={styles.ecoLines}>
            {nodes.map(n => (
              <line
                key={`line-${n.id}`}
                x1={n.x}
                y1={n.y}
                x2="50%"
                y2="50%"
                className={`${styles.connectorLine} ${activeNode === n.id ? styles.connectorLineActive : ''}`}
              />
            ))}

            {/* Glowing moving particles towards center */}
            {activeNode && (
              <circle r="5" className={styles.glowPulse}>
                <animateMotion
                  dur="1.2s"
                  repeatCount="indefinite"
                  path={
                    activeNode === 'inventory' ? 'M 288 110 L 600 240' :
                    activeNode === 'sales' ? 'M 912 110 L 600 240' :
                    activeNode === 'purchases' ? 'M 252 278 L 600 240' :
                    activeNode === 'reports' ? 'M 948 278 L 600 240' :
                    'M 600 403 L 600 240'
                  }
                />
              </circle>
            )}
          </svg>

          {/* Central Cube Node */}
          <div className={`${styles.ecoCore} ${activeNode ? styles.ecoCoreHovered : ''}`}>
            <div className={`${styles.ecoCube} ${activeNode === 'ai' ? styles.ecoCubePurple : ''}`}></div>
          </div>

          {/* Connected Nodes */}
          {nodes.map(n => (
            <div
              key={n.id}
              className={`${styles.ecoNode} ${n.className} ${activeNode === n.id ? styles.ecoNodeActive : ''}`}
              onMouseEnter={() => setActiveNode(n.id)}
              onMouseLeave={() => setActiveNode(null)}
              style={{
                borderColor: activeNode === n.id ? n.color : 'rgba(15, 23, 42, 0.06)'
              }}
            >
              <div 
                className={styles.ecoNodeIcon}
                style={{ 
                  background: n.bg, 
                  border: `1px solid ${n.border}`, 
                  color: n.color 
                }}
              >
                {n.icon}
              </div>
              <div className={styles.ecoNodeMeta}>
                <strong>{n.title}</strong>
                <span>{n.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Connected Node Description panel */}
        <div style={{ height: '60px', marginTop: '24px', textAlign: 'center' }}>
          {activeNode ? (
            <div style={{ animation: 'fadeIn 0.2s ease-out', color: '#475569', fontSize: '0.92rem', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Sparkles size={16} style={{ color: '#13a66a' }} />
              {nodes.find(n => n.id === activeNode)?.text}
            </div>
          ) : (
            <p style={{ color: '#94A3B8', fontSize: '0.88rem', fontStyle: 'italic' }}>
              Hover over any node above to explore active pipeline operations.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
