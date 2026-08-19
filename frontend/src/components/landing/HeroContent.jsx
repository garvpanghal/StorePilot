import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Zap, Clock, Star } from 'lucide-react';
import styles from '../../styles/landing.module.css';

export default function HeroContent({ onClickWatchDemo }) {
  return (
    <div className={styles.heroLeft}>
      <div className={styles.heroSubtitle}>
        INVENTORY &middot; SALES &middot; INTELLIGENCE
      </div>
      <h1 className={styles.heroTitle}>
        YOUR STORE<br className={styles.mobileOnlyBr} /> HAS A SIGNAL.<br />
        <span className={styles.heroTitleHighlight}>STOREPILOT<br className={styles.mobileOnlyBr} /> HELPS YOU<br className={styles.mobileOnlyBr} /> SEE IT.</span>
      </h1>
      
      <p className={styles.heroDesc}>
        Unify inventory, sales, purchases and insights in one intelligent system.
      </p>

      <div className={styles.heroCTAs}>
        <Link to="/login" className={styles.ctaBtnMain}>
          Open StorePilot <ArrowRight size={15} style={{ marginLeft: '2px' }} />
        </Link>
        <button className={styles.watchBtn} onClick={onClickWatchDemo}>
          <Play size={12} fill="#F4F7F6" /> Watch it work
        </button>
      </div>

      <div className={styles.heroBenefits}>
        <div className={styles.benefitItem}>
          <Zap size={12} />
          <span>No Credit Card Required</span>
        </div>
        <div className={styles.benefitItem}>
          <Clock size={12} />
          <span>Setup in Minutes</span>
        </div>
        <div className={styles.benefitItem}>
          <Star size={12} />
          <span>Built for Retailers</span>
        </div>
      </div>
    </div>
  );
}
