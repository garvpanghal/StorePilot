import React, { useState } from 'react';
import { Package, Truck, Layers, ShoppingCart, BarChart3, Bot, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import styles from '../../styles/landing.module.css';

export default function WorkflowSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { 
      label: 'Low Stock Alert', 
      desc: 'System flags critical levels', 
      icon: <Package size={20} />, 
      title: '1. Inventory Flags Low Quantities', 
      text: 'StorePilot monitors item velocities. When Amul Milk drops below 20 units, the system flags the critical low-stock status.',
      detailIcon: <Package size={24} />,
      color: '#13a66a'
    },
    { 
      label: 'Purchase Order', 
      desc: 'Raise supplier procurement', 
      icon: <Truck size={20} />, 
      title: '2. Raise Multi-Item Supplier Order', 
      text: 'Draft purchase orders directly inside the Procurement module. The PO links to registered vendor email directories.',
      detailIcon: <Truck size={24} />,
      color: '#13a66a'
    },
    { 
      label: 'Stock Increment', 
      desc: 'Inventory updates on arrival', 
      icon: <Layers size={20} />, 
      title: '3. Receive & Increment Catalog Values', 
      text: 'Upon shipment delivery, marking the PO completed automatically increments your current stock count without manual math.',
      detailIcon: <Layers size={24} />,
      color: '#13a66a'
    },
    { 
      label: 'Customer Sale', 
      desc: 'Capture invoice checkout', 
      icon: <ShoppingCart size={20} />, 
      title: '4. POS Checkout Depletes Stock', 
      text: 'Billing walk-in sales decrements current inventory levels instantly, feeding total transaction reports.',
      detailIcon: <ShoppingCart size={24} />,
      color: '#13a66a'
    },
    { 
      label: 'Report Update', 
      desc: 'Live P&L calculations', 
      icon: <BarChart3 size={20} />, 
      title: '5. Margin Sheets Re-calculated', 
      text: 'Revenue, Profit, and Category margins update in real-time, preparing exportable CSV datasets.',
      detailIcon: <BarChart3 size={24} />,
      color: '#13a66a'
    },
    { 
      label: 'AI Recommendation', 
      desc: 'Cycle repeats intelligently', 
      icon: <Bot size={20} />, 
      title: '6. AI Predicts Optimal Reorder Level', 
      text: 'StorePilot Assistant reviews weekly demand spikes to suggest higher reorder safety thresholds for the upcoming month.',
      detailIcon: <Bot size={24} />,
      color: '#8B5CF6'
    }
  ];

  const current = steps[activeStep];

  return (
    <section className={styles.lightSection} style={{ borderTop: '1px solid rgba(15, 23, 42, 0.06)' }}>
      <div className={styles.container}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className={styles.lightEyebrow}>Operational Loop</div>
          <h2 className={styles.sectionTitle}>
            From insight <span className={styles.sectionTitleHighlight}>to action.</span>
          </h2>
          <p className={styles.sectionDesc}>
            StorePilot coordinates the complete lifecycle of your store operations seamlessly.
          </p>
        </div>

        {/* Process Flow Timeline */}
        <div className={styles.flowContainer}>
          <div className={styles.flowLine}>
            <div 
              className={styles.flowLineActive} 
              style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>

          <div className={styles.flowTrack}>
            {steps.map((s, idx) => (
              <div 
                key={idx} 
                className={styles.flowStep}
                onClick={() => setActiveStep(idx)}
              >
                <div className={`${styles.flowStepCircle} ${activeStep === idx ? styles.flowStepCircleActive : ''} ${idx === 5 && activeStep === idx ? styles.flowStepCircleActivePurple : ''}`}>
                  {s.icon}
                </div>
                <div className={styles.flowStepMeta}>
                  <strong>{s.label}</strong>
                  <span>{s.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Step Description Card */}
        <div className={styles.flowDetails}>
          <div 
            className={styles.flowDetailsIcon}
            style={{ 
              background: activeStep === 5 ? 'rgba(139, 92, 246, 0.08)' : 'rgba(25, 230, 140, 0.08)',
              color: activeStep === 5 ? '#8B5CF6' : '#13a66a'
            }}
          >
            {current.detailIcon}
          </div>
          <div className={styles.flowDetailsMeta}>
            <h4>{current.title}</h4>
            <p>{current.text}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
