import React, { useState } from 'react';
import { Check, Store, Package, RefreshCw, User, Briefcase, Plus } from 'lucide-react';
import styles from '../../styles/landing.module.css';

export default function UseCasesSection() {
  const [activeTab, setActiveTab] = useState('retail');

  const content = {
    retail: {
      title: 'Retail Outlets & Boutiques',
      desc: 'Coordinate item variants, catalog categories, pricing offsets, and track profit splits cleanly.',
      bullets: [
        'Track variants by SKU, category and cost levels',
        'Compare product margin performance across directories',
        'Manage pricing tags and billing discounts easily'
      ],
      items: [
        { name: 'Denim Jeans (Blue)', stock: 45, price: '₹1,499' },
        { name: 'Casual Cotton Shirt', stock: 72, price: '₹899' },
        { name: 'Leather Boots', stock: 12, price: '₹3,499' }
      ]
    },
    grocery: {
      title: 'Groceries & FMCG Supermarkets',
      desc: 'Never run out of essential stock items. Manage daily arrival increments, monitor fast-moving velocity thresholds, and automate supplier reorders.',
      bullets: [
        'Automatic low-stock warnings linked to velocity metrics',
        'Quick POS checkout codes to minimize checkout queue times',
        'Check dairy, staples, and fresh stock count values easily'
      ],
      items: [
        { name: '🥛 Amul Milk 500ml', stock: 18, price: '₹27' },
        { name: '🍞 Sliced Bread (White)', stock: 22, price: '₹40' },
        { name: '🥚 Fresh Eggs 12-Pack', stock: 65, price: '₹90' }
      ]
    },
    wholesale: {
      title: 'Wholesale & Distributors',
      desc: 'Raise large purchase orders, coordinate vendor payments, track supplier timelines, and check total procurement spend values.',
      bullets: [
        'Coordinated supplier email directory records',
        'Automated stock counts increment on PO approval',
        'Track cash, card and UPI payments in billing sheets'
      ],
      items: [
        { name: '📦 Wheat Flour Bulk (50kg)', stock: 110, price: '₹2,100' },
        { name: '🍚 Premium Basmati Rice (25kg)', stock: 85, price: '₹1,850' },
        { name: '🧂 Iodized Salt Cartons', stock: 240, price: '₹750' }
      ]
    }
  };

  const current = content[activeTab];

  return (
    <section id="pricing" className={styles.lightSection} style={{ borderTop: '1px solid rgba(15, 23, 42, 0.06)', background: '#F8FAFC' }}>
      <div className={styles.container}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className={styles.lightEyebrow}>Store Flexibility</div>
          <h2 className={styles.sectionTitle}>
            Built around the way <span className={styles.sectionTitleHighlight}>your business actually works.</span>
          </h2>
          <p className={styles.sectionDesc}>
            StorePilot adapts to your specific business model. Choose your vertical below to see it in action.
          </p>
        </div>

        {/* Use case tabs */}
        <div className={styles.useCaseSelect}>
          <button 
            className={`${styles.useCaseSelectBtn} ${activeTab === 'retail' ? styles.useCaseSelectBtnActive : ''}`}
            onClick={() => setActiveTab('retail')}
          >
            Retail Outlets
          </button>
          <button 
            className={`${styles.useCaseSelectBtn} ${activeTab === 'grocery' ? styles.useCaseSelectBtnActive : ''}`}
            onClick={() => setActiveTab('grocery')}
          >
            Grocery & Supermarket
          </button>
          <button 
            className={`${styles.useCaseSelectBtn} ${activeTab === 'wholesale' ? styles.useCaseSelectBtnActive : ''}`}
            onClick={() => setActiveTab('wholesale')}
          >
            Wholesale & Supply
          </button>
        </div>

        {/* Display Frame */}
        <div className={styles.useCaseDisplay}>
          <div className={styles.useCaseLeft}>
            <h3>{current.title}</h3>
            <p>{current.desc}</p>
            <ul className={styles.useCaseList}>
              {current.bullets.map((b, idx) => (
                <li key={idx} className={styles.useCaseListItem}>
                  <Check size={16} />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Mock Preview Workspace */}
          <div className={styles.useCaseRight}>
            <div className={styles.useCaseRightHeader}>
              <span>Active Catalog (Mock Preview)</span>
              <Plus size={14} style={{ color: '#19E68C' }} />
            </div>
            <div className={styles.useCaseRightItems}>
              {current.items.map((it, idx) => (
                <div key={idx} className={styles.useCaseRightItem}>
                  <span>{it.name}</span>
                  <strong>Stock: {it.stock} <span style={{ color: '#19E68C', marginLeft: '8px' }}>{it.price}</span></strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
