import React from 'react';
import { Store, Star } from 'lucide-react';
import styles from '../../styles/landing.module.css';

export default function StoreTypes() {
  const cases = [
    { title: "Grocery & FMCG", quote: "Manage daily essentials rotation, track fast-moving milk/dairy stock levels, and set custom reorder notifications automatically." },
    { title: "Retail Outlets", quote: "Analyze categories, track margins, and coordinate stock updates cleanly across multi-brand product catalogues." },
    { title: "Wholesale & Distributors", quote: "Record multi-item purchase orders, coordinate vendor payments, track supplier timelines, and check procurement costs." }
  ];

  return (
    <section className={styles.lightSection} style={{ borderTop: '1px solid rgba(0, 0, 0, 0.05)', background: '#F8FAFC' }}>
      <div className={styles.container}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className={styles.lightEyebrow}>Store Categories</div>
          <h2 className={styles.sectionTitle}>Built for modern store owners</h2>
          <p className={styles.sectionDesc} style={{ margin: '0 auto' }}>
            StorePilot adapts to your specific business model. No generic configurations required.
          </p>
        </div>

        <div className={styles.testiGrid}>
          {cases.map((c, idx) => (
            <div key={idx} className={styles.testiCard}>
              <div>
                <div className={styles.testiStars}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={15} fill="#f59e0b" stroke="none" />)}
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#101828', marginBottom: '12px' }}>
                  {c.title}
                </div>
                <p className={styles.testiQuote}>
                  "{c.quote}"
                </p>
              </div>

              <div className={styles.testiUser}>
                <div className={styles.testiAvatar}>SP</div>
                <div className={styles.testiMeta}>
                  <strong>Verify Mode</strong>
                  <span>Operational Standard</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
