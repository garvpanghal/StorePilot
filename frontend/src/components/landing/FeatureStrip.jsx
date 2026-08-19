import React, { useState, useRef, useEffect } from 'react';
import { Package, ShoppingCart, BarChart3, Bot } from 'lucide-react';
import styles from '../../styles/landing.module.css';

export default function FeatureStrip({ onHoverFeature, activeFeature }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const containerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const items = [
    { id: 'inventory', title: 'Inventory', desc: 'Track stock in real-time', icon: <Package size={16} /> },
    { id: 'sales', title: 'Sales', desc: 'Monitor orders and revenue', icon: <ShoppingCart size={16} /> },
    { id: 'reports', title: 'Reports', desc: 'Understand store performance', icon: <BarChart3 size={16} /> },
    { id: 'ai', title: '✦ AI Insights', desc: 'Get intelligent recommendations', icon: <Bot size={16} /> }
  ];

  // Update moving indicator bar
  useEffect(() => {
    if (hoverIndex === null || !containerRef.current) {
      setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
      return;
    }

    const itemEls = containerRef.current.children;
    const hoveredEl = itemEls[hoverIndex];
    if (hoveredEl) {
      const rect = hoveredEl.getBoundingClientRect();
      const parentRect = containerRef.current.getBoundingClientRect();
      const relativeLeft = rect.left - parentRect.left;
      setIndicatorStyle({
        left: relativeLeft,
        width: rect.width,
        opacity: 1
      });
    }
  }, [hoverIndex]);

  const handleMouseEnter = (id, idx) => {
    setHoverIndex(idx);
    onHoverFeature(id);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    onHoverFeature(null);
  };

  return (
    <div className={styles.bottomStrip}>
      {/* DESKTOP HOVER STRIP */}
      <div className={styles.bottomStripDesktop}>
        <div className={styles.stripInner} ref={containerRef} onMouseLeave={handleMouseLeave}>
          {items.map((item, idx) => (
            <div
              key={item.id}
              className={`${styles.stripItem} ${activeFeature === item.id || hoverIndex === idx ? styles.stripItemActive : ''}`}
              onMouseEnter={() => handleMouseEnter(item.id, idx)}
            >
              <div className={`${styles.stripIcon} ${item.id === 'ai' && (activeFeature === 'ai' || hoverIndex === idx) ? styles.stripItemActiveAI : ''}`}>
                {item.icon}
              </div>
              <div className={styles.stripMeta}>
                <strong>{item.title}</strong>
                <span>{item.desc}</span>
              </div>
            </div>
          ))}

          {/* Sliding active highlight indicator bar */}
          <div 
            className={`${styles.stripIndicator} ${hoverIndex === 3 ? styles.stripIndicatorAI : ''}`} 
            style={indicatorStyle}
          />
        </div>
      </div>

      {/* MOBILE EDITORIAL LIST */}
      <div className={styles.bottomStripMobile}>
        <div className={styles.mobileFeaturesTitle}>BUILT FOR YOUR STORE</div>
        <div className={styles.mobileFeaturesList}>
          {items.map((item, idx) => (
            <div key={item.id} className={styles.mobileFeatureItem}>
              <div className={styles.mobileFeatureHeader}>
                <span className={styles.mobileFeatureNum}>0{idx + 1}</span>
                <strong className={styles.mobileFeatureName}>{item.title.replace('✦ ', '')}</strong>
              </div>
              <p className={styles.mobileFeatureDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
