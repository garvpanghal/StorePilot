import React, { useState, useEffect } from 'react';
import { ArrowRight, Bot, AlertTriangle, TrendingUp, HelpCircle, Package, ArrowUpRight } from 'lucide-react';
import styles from '../../styles/landing.module.css';

export default function DashboardShowcase() {
  const [rev, setRev] = useState(0);
  const [prof, setProf] = useState(0);
  const [orders, setOrders] = useState(0);
  const [lowStock, setLowStock] = useState(0);

  useEffect(() => {
    const duration = 1800;
    const steps = 60;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setRev(Math.floor((128450 / steps) * step));
      setProf(Math.floor((32680 / steps) * step));
      setOrders(Math.floor((320 / steps) * step));
      setLowStock(Math.floor((8 / steps) * step));

      if (step >= steps) {
        clearInterval(timer);
        setRev(128450);
        setProf(32680);
        setOrders(320);
        setLowStock(8);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className={styles.darkSection} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className={styles.container}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className={styles.sectionEyebrow}>Product Showcase</div>
          <h2 className={styles.sectionTitle} style={{ color: '#F8FAFC' }}>
            See what's happening <span className={styles.heroTitleHighlight}>in your store.</span>
          </h2>
          <p className={styles.heroDesc} style={{ margin: '0 auto', textAlign: 'center' }}>
            Sales, inventory, purchasing and performance — visible in one place.
          </p>
        </div>

        {/* Large Dashboard Preview Visual */}
        <div className={styles.showcaseContainer}>
          {/* Header Bar */}
          <div className={styles.previewTop} style={{ marginBottom: '24px' }}>
            <div className={styles.previewLogo}>
              <img src="/assets/logo-light.png" alt="StorePilot Logo" style={{ height: '24px' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '6px', height: '28px', width: '220px', border: '1px solid rgba(255,255,255,0.08)' }}></div>
              <span className={styles.watchBtnIcon} style={{ background: '#19E68C', color: '#05070D', border: 0 }}><Bot size={16} /></span>
            </div>
          </div>

          <div className={styles.previewGrid}>
            {/* Sidebar Mock */}
            <div className={styles.previewSidebar}>
              <div className={`${styles.sidebarItem} ${styles.sidebarItemActive}`} style={{ height: '24px', marginBottom: '8px' }}></div>
              <div className={styles.sidebarItem} style={{ height: '24px', marginBottom: '8px' }}></div>
              <div className={styles.sidebarItem} style={{ height: '24px', marginBottom: '8px' }}></div>
              <div className={styles.sidebarItem} style={{ height: '24px', marginBottom: '8px' }}></div>
              <div className={styles.sidebarItem} style={{ height: '24px', marginBottom: '8px' }}></div>
            </div>

            {/* Dashboard Workspace */}
            <div className={styles.previewMain}>
              {/* KPIs Grid */}
              <div className={styles.previewKpis} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className={styles.previewKpi} style={{ padding: '16px' }}>
                  <span>Total Revenue</span>
                  <strong style={{ fontSize: '1.25rem', marginTop: '6px' }}>₹{rev.toLocaleString('en-IN')}</strong>
                  <div className={styles.change} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <TrendingUp size={12} /> +12.4% vs last 7 days
                  </div>
                </div>

                <div className={styles.previewKpi} style={{ padding: '16px' }}>
                  <span>Total Profit</span>
                  <strong style={{ fontSize: '1.25rem', marginTop: '6px' }}>₹{prof.toLocaleString('en-IN')}</strong>
                  <div className={styles.change} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <TrendingUp size={12} /> +8.7% vs last 7 days
                  </div>
                </div>

                <div className={styles.previewKpi} style={{ padding: '16px' }}>
                  <span>Total Orders</span>
                  <strong style={{ fontSize: '1.25rem', marginTop: '6px' }}>{orders}</strong>
                  <div className={styles.change} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <TrendingUp size={12} /> +15.2% vs last 7 days
                  </div>
                </div>

                <div className={`${styles.previewKpi} ${styles.pulseWarning}`} style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <span style={{ color: '#ef4444' }}>Low Stock Items</span>
                  <strong style={{ fontSize: '1.25rem', marginTop: '6px', color: '#ef4444' }}>{lowStock}</strong>
                  <div style={{ color: '#ef4444', fontSize: '0.65rem', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={12} /> Action required
                  </div>
                </div>
              </div>

              {/* Main Charts & List grid */}
              <div className={styles.previewContentGrid} style={{ gridTemplateColumns: '1.6fr 1fr', gap: '16px' }}>
                {/* Sales Overview Chart */}
                <div className={styles.previewChartCard} style={{ padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div className={styles.previewChartTitle} style={{ fontSize: '0.85rem' }}>Sales Overview</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(248, 250, 252, 0.5)', background: 'rgba(255,255,255,0.04)', padding: '4px 8px', borderRadius: '4px' }}>Weekly</div>
                  </div>
                  <div className={styles.previewChart} style={{ height: '160px' }}>
                    <svg viewBox="0 0 400 150" style={{ width: '100%', height: '100%' }}>
                      <path
                        d="M 10 130 Q 80 50 150 110 T 290 40 T 390 20"
                        fill="none"
                        stroke="#8B5CF6"
                        strokeWidth="3.5"
                        className={styles.chartPath}
                      />
                      <path
                        d="M 10 130 Q 80 50 150 110 T 290 40 T 390 20 L 390 150 L 10 150 Z"
                        fill="url(#chartGlow)"
                      />
                      <circle cx="290" cy="40" r="5" fill="#19E68C" />
                      <circle cx="390" cy="20" r="5" fill="#19E68C" />
                    </svg>
                  </div>
                </div>

                {/* Top Selling Products */}
                <div className={styles.previewProductsCard} style={{ padding: '18px' }}>
                  <div className={styles.previewChartTitle} style={{ fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Package size={14} style={{ color: '#19E68C' }} />
                    Top Performing Products
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className={styles.previewProdItem} style={{ padding: '10px 0', opacity: 1 }}>
                      <span style={{ fontSize: '0.78rem', color: '#F8FAFC' }}>🥛 Amul Milk 500ml</span>
                      <strong>230 units <span style={{ color: '#19E68C', marginLeft: '6px' }}>₹18,450</span></strong>
                    </div>
                    <div className={styles.previewProdItem} style={{ padding: '10px 0', opacity: 1 }}>
                      <span style={{ fontSize: '0.78rem', color: '#F8FAFC' }}>🌾 Rice 5kg</span>
                      <strong>120 units <span style={{ color: '#19E68C', marginLeft: '6px' }}>₹14,320</span></strong>
                    </div>
                    <div className={styles.previewProdItem} style={{ padding: '10px 0', opacity: 1 }}>
                      <span style={{ fontSize: '0.78rem', color: '#F8FAFC' }}>🍪 Wheat Atta 5kg</span>
                      <strong>90 units <span style={{ color: '#19E68C', marginLeft: '6px' }}>₹10,350</span></strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
