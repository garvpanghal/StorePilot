import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import styles from '../../styles/landing.module.css';

export default function FinalCTA() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <section className={styles.darkSection} style={{ padding: '100px 24px' }}>
      <div className={styles.container}>
        <div className={styles.ctaBox}>
          <h2 className={styles.ctaTitle}>
            Ready to take control of your <span className={styles.ctaTitleHighlight}>store?</span>
          </h2>
          <p className={styles.ctaDesc}>
            Bring your operations, analytics and intelligence into one place.
          </p>

          <form onSubmit={handleSubmit} className={styles.ctaForm}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              className={styles.ctaInput} 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required 
            />
            <button type="submit" className={styles.ctaBtn}>
              Start Free Trial <ArrowRight size={16} />
            </button>
          </form>

          <div className={styles.ctaGrid}>
            <div className={styles.benefitItem}>
              <CheckCircle2 size={14} />
              Easy Setup
            </div>
            <div className={styles.benefitItem}>
              <CheckCircle2 size={14} />
              Powerful Analytics
            </div>
            <div className={styles.benefitItem}>
              <CheckCircle2 size={14} />
              Intelligent Insights
            </div>
            <div className={styles.benefitItem}>
              <CheckCircle2 size={14} />
              Secure Store Management
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
