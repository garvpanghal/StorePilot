import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, BarChart3, Bot, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/landing.module.css';
import AIInsight from './AIInsight';

export default function DashboardPreview({ activeFeature, demoTrigger }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [style, setStyle] = useState({});

  // Default values
  const [rev, setRev] = useState(84240);
  const [prof, setProf] = useState(21340);
  const [orders, setOrders] = useState(1284);
  const [lowStock, setLowStock] = useState(8);
  const [showAi, setShowAi] = useState(false);
  const [demoStep, setDemoStep] = useState(0); // 0: Idle, 1: Inventory drops, 2: Sale occurs, 3: Revenue ticks up, 4: AI notices, 5: Resetting

  // KPI Number Count-up on mount
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setRev(Math.floor((84240 / steps) * step));
      setProf(Math.floor((21340 / steps) * step));
      setOrders(Math.floor((1284 / steps) * step));
      setLowStock(Math.floor((8 / steps) * step));

      if (step >= steps) {
        clearInterval(timer);
        setRev(84240);
        setProf(21340);
        setOrders(1284);
        setLowStock(8);
        setShowAi(true); // Show AI notification after stats settle
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  // Watch It Work simulation triggers
  useEffect(() => {
    if (!demoTrigger) return;

    // Start Demo sequence
    setDemoStep(1);
    // 1. Inventory drops
    setLowStock(9);
    
    // 2. Sale triggers
    const t2 = setTimeout(() => {
      setDemoStep(2);
      setOrders(1285);
    }, 1000);

    // 3. Revenue increments
    const t3 = setTimeout(() => {
      setDemoStep(3);
      setRev(84330);
      setProf(21370);
    }, 2000);

    // 4. AI alert updates
    const t4 = setTimeout(() => {
      setDemoStep(4);
    }, 3000);

    // 5. Reset to baseline
    const t5 = setTimeout(() => {
      setDemoStep(0);
      setRev(84240);
      setProf(21340);
      setOrders(1284);
      setLowStock(8);
    }, 4500);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [demoTrigger]);

  // Subtle 3D tilt tracking
  const handleMouseMove = (e) => {
    // Disable on mobile/touch interfaces natively
    if (window.matchMedia('(max-width: 1024px)').matches) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotateX = -(y / rect.height) * 3; // Max 2-3 degrees
    const rotateY = (x / rect.width) * 3;

    setStyle({
      transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`,
      transition: 'transform 0.08s ease'
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.4s ease'
    });
  };

  const handleNavigationToAI = () => {
    navigate(user ? '/dashboard' : '/login');
  };

  return (
    <div className={styles.heroRight}>
      <div
        ref={containerRef}
        className={`${styles.previewContainer} ${activeFeature === 'ai' || demoStep === 4 ? styles.previewContainerActiveHighlightPurple : activeFeature ? styles.previewContainerActiveHighlight : ''}`}
        style={style}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Top bar mockup */}
        <div className={styles.previewTop}>
          <div className={styles.previewLogo}>
            <span></span>
            StorePilot Dashboard
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ width: '120px', height: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }}></div>
            <div className={styles.previewProfile}></div>
          </div>
        </div>

        {/* Sidebar + main container grid */}
        <div className={styles.previewGrid}>
          <div className={styles.previewSidebar}>
            <div className={`${styles.sidebarItem} ${styles.sidebarItemActive}`}></div>
            <div className={styles.sidebarItem}></div>
            <div className={styles.sidebarItem}></div>
            <div className={styles.sidebarItem}></div>
            <div className={styles.sidebarItem}></div>
          </div>

          <div className={styles.previewMain}>
            {/* KPI Cards */}
            <div className={styles.previewKpis}>
              <div className={`${styles.previewKpi} ${activeFeature === 'sales' || demoStep === 3 ? styles.kpiHighlight : ''}`}>
                <span>Total Revenue</span>
                <strong>₹{rev.toLocaleString('en-IN')}</strong>
                <span className={styles.change}>+12.4%</span>
              </div>
              <div className={`${styles.previewKpi} ${activeFeature === 'reports' || demoStep === 3 ? styles.kpiHighlight : ''}`}>
                <span>Total Profit</span>
                <strong>₹{prof.toLocaleString('en-IN')}</strong>
                <span className={styles.change}>+8.7%</span>
              </div>
              <div className={`${styles.previewKpi} ${activeFeature === 'sales' || demoStep === 2 ? styles.kpiHighlight : ''}`}>
                <span>Total Orders</span>
                <strong>{orders.toLocaleString()}</strong>
                <span className={styles.change}>+15.2%</span>
              </div>
              <div className={`${styles.previewKpi} ${activeFeature === 'inventory' || demoStep === 1 ? styles.kpiHighlight : ''} ${lowStock > 8 ? styles.pulseWarning : ''}`}>
                <span>Low Stock Items</span>
                <strong style={{ color: lowStock > 8 ? '#f87171' : 'inherit' }}>{lowStock}</strong>
                <span className={styles.change} style={{ color: lowStock > 8 ? '#f87171' : 'inherit' }}>
                  {lowStock > 8 ? 'Reorder warning' : 'Normal'}
                </span>
              </div>
            </div>

            {/* Sales Chart + Top Products */}
            <div className={styles.previewContentGrid}>
              <div className={`${styles.previewChartCard} ${activeFeature === 'sales' || demoStep === 2 ? styles.chartHighlight : ''}`}>
                <div className={styles.previewChartTitle}>Sales Overview</div>
                <div className={styles.previewChart}>
                  <svg viewBox="0 0 300 120" style={{ width: '100%', height: '100%' }}>
                    <defs>
                      <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#5EEAD4" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#5EEAD4" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 10 100 Q 50 40 90 70 T 170 30 T 250 50 T 290 20"
                      fill="none"
                      stroke="#5EEAD4"
                      strokeWidth="2.5"
                      className={styles.chartPath}
                    />
                    <path
                      d="M 10 100 Q 50 40 90 70 T 170 30 T 250 50 T 290 20 L 290 120 L 10 120 Z"
                      fill="url(#chartGlow)"
                    />
                    <circle cx="290" cy="20" r="3.5" fill="#5EEAD4" />
                  </svg>
                </div>
              </div>

              <div className={`${styles.previewProductsCard} ${activeFeature === 'reports' || demoStep === 1 ? styles.productsHighlight : ''}`}>
                <div className={styles.previewChartTitle}>Top Products</div>
                <div className={styles.previewProdItem} style={{ opacity: 1 }}>
                  <span>🥛 Amul Milk 500ml</span>
                  <strong>{demoStep === 1 ? '17 units' : '230 units'}</strong>
                </div>
                <div className={styles.previewProdItem} style={{ opacity: 1 }}>
                  <span>🌾 Rice 5kg</span>
                  <strong>120 units</strong>
                </div>
                <div className={styles.previewProdItem} style={{ opacity: 1 }}>
                  <span>🍪 Wheat Atta 5kg</span>
                  <strong>90 units</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Notification Orb */}
      <AIInsight 
        active={showAi || activeFeature === 'ai' || demoStep === 4} 
        onClickNotification={handleNavigationToAI}
      />
    </div>
  );
}
