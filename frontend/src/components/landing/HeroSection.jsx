import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Play, Sparkles } from 'lucide-react';
import styles from '../../styles/landing.module.css';
import DashboardPreview from './DashboardPreview';

export default function HeroSection() {
  return (
    <section className={styles.heroSection}>
      <div className={styles.container}>
        <div className={styles.heroGrid}>
          <div className={styles.heroLeft}>
            <div className={styles.badge}>
              <Sparkles size={13} />
              AI-Powered Store Management
            </div>
            
            <h1 className={styles.heroTitle}>
              <span>Your store.</span>
              <span className={styles.heroTitleHighlight}>Smarter</span>
              <span>every day.</span>
            </h1>

            <p className={styles.heroDesc}>
              Unify inventory, sales, purchases and insights in one intelligent system.
            </p>

            <div className={styles.heroCTAs}>
              <Link to="/login" className={styles.trialBtn} style={{ padding: '12px 28px', fontSize: '0.98rem' }}>
                Start Free Trial <ArrowRight size={16} />
              </Link>
              <button className={styles.watchBtn}>
                <span className={styles.watchBtnIcon}>
                  <Play size={14} fill="#fff" />
                </span>
                Watch how it works
              </button>
            </div>

            <div className={styles.heroBenefits}>
              <div className={styles.benefitItem}>
                <CheckCircle2 size={14} />
                No Credit Card Required
              </div>
              <div className={styles.benefitItem}>
                <CheckCircle2 size={14} />
                Setup in 2 Minutes
              </div>
              <div className={styles.benefitItem}>
                <CheckCircle2 size={14} />
                Loved by Store Owners
              </div>
            </div>
          </div>

          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
