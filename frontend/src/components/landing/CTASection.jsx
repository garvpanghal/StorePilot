import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import styles from '../../styles/landing.module.css';

export default function CTASection() {
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
            Join thousands of store owners who trust StorePilot to run their business smarter.
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
              <CheckCircle size={14} />
              7-Day Free Trial
            </div>
            <div className={styles.benefitItem}>
              <CheckCircle size={14} />
              Easy Setup
            </div>
            <div className={styles.benefitItem}>
              <CheckCircle size={14} />
              Cancel Anytime
            </div>
            <div className={styles.benefitItem}>
              <CheckCircle size={14} />
              Secure & Reliable
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
