import React, { useState } from 'react';
import { Package, ShoppingCart, Truck, BarChart3, Bot } from 'lucide-react';
import styles from '../../styles/landing.module.css';

export default function ConnectedSystems() {
  const [activeNode, setActiveNode] = useState(null);

  const nodes = [
    { id: 'inventory', title: 'Inventory', desc: 'Real-time tracking', icon: <Package size={18} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.2)', className: styles.node1, x: '24%', y: '23%' },
    { id: 'sales', title: 'Sales', desc: 'Fast & simple billing', icon: <ShoppingCart size={18} />, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.2)', className: styles.node2, x: '76%', y: '23%' },
    { id: 'purchases', title: 'Purchases', desc: 'Manage & track', icon: <Truck size={18} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.2)', className: styles.node3, x: '21%', y: '58%' },
    { id: 'reports', title: 'Reports', desc: 'Smart analytics', icon: <BarChart3 size={18} />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.2)', className: styles.node4, x: '79%', y: '58%' },
    { id: 'ai', title: 'AI Insights', desc: 'Smarter decisions', icon: <Bot size={18} />, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.08)', border: 'rgba(139, 92, 246, 0.2)', className: styles.node5, x: '50%', y: '84%' },
  ];

  return (
    <section id="product" className={styles.lightSection}>
      <div className={styles.container}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className={styles.lightEyebrow}>Built for stores of all sizes</div>
          <h2 className={styles.sectionTitle}>
            Everything connects. <span className={styles.sectionTitleHighlight}>Everything works.</span>
          </h2>
          <p className={styles.sectionDesc} style={{ margin: '0 auto' }}>
            From stock to sales to strategy — StorePilot keeps your business in sync.
          </p>
        </div>

        <div className={styles.ecoWrap}>
          {/* SVG Connection Lines */}
          <svg className={styles.ecoLines}>
            {/* Background passive line connections */}
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

            {/* Glowing moving particles */}
            {activeNode && (
              <circle r="4" className={styles.glowPulse}>
                <animateMotion
                  dur="1.2s"
                  repeatCount="indefinite"
                  path={
                    activeNode === 'inventory' ? 'M 192 96 L 400 210' :
                    activeNode === 'sales' ? 'M 608 96 L 400 210' :
                    activeNode === 'purchases' ? 'M 168 243 L 400 210' :
                    activeNode === 'reports' ? 'M 632 243 L 400 210' :
                    'M 400 352 L 400 210'
                  }
                />
              </circle>
            )}
          </svg>

          {/* Central Cube Node */}
          <div className={styles.ecoCore}>
            <div className={styles.ecoCube}></div>
          </div>

          {/* Connected Nodes */}
          {nodes.map(n => (
            <div
              key={n.id}
              className={`${styles.ecoNode} ${n.className} ${activeNode === n.id ? styles.ecoNodeActive : ''}`}
              onMouseEnter={() => setActiveNode(n.id)}
              onMouseLeave={() => setActiveNode(null)}
            >
              <div 
                className={styles.ecoNodeIcon}
                style={{ background: n.bg, border: `1px solid ${n.border}`, color: n.color }}
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
      </div>
    </section>
  );
}
