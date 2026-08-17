import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';
import styles from '../../styles/landing.module.css';

export default function LandingFooter({ onOpenAbout }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          {/* Brand Info */}
          <div className={styles.footerBrand}>
            <div className={styles.footerBrandLogo}>
              <img src="/assets/logo-light.png" alt="StorePilot" />
            </div>
            <p className={styles.footerBrandDesc}>
              The all-in-one store management platform designed to help you save time, reduce errors and grow your profits.
            </p>
            <div className={styles.footerSocials}>
              <a href="https://twitter.com" className={styles.footerSocialBtn} target="_blank" rel="noreferrer" aria-label="Twitter"><Twitter size={14} /></a>
              <a href="https://facebook.com" className={styles.footerSocialBtn} target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={14} /></a>
              <a href="https://instagram.com" className={styles.footerSocialBtn} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={14} /></a>
              <a href="https://linkedin.com" className={styles.footerSocialBtn} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={14} /></a>
            </div>
          </div>

          {/* Product links */}
          <div className={styles.footerCol}>
            <h4>Product</h4>
            <ul>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/inventory">Inventory</Link></li>
              <li><Link to="/sales">Sales POS</Link></li>
              <li><Link to="/purchases">Purchases PO</Link></li>
              <li><Link to="/reports">Reports</Link></li>
            </ul>
          </div>

          {/* Intelligence links */}
          <div className={styles.footerCol}>
            <h4>Intelligence</h4>
            <ul>
              <li><Link to="/dashboard">AI Assistant</Link></li>
              <li><Link to="/dashboard">Insights</Link></li>
              <li><Link to="/dashboard">Recommendations</Link></li>
            </ul>
          </div>

          {/* Resources links */}
          <div className={styles.footerCol}>
            <h4>Resources</h4>
            <ul>
              <li><a href="#docs">Documentation</a></li>
              <li><a href="#help">Help Center</a></li>
              <li><a href="#updates">Updates</a></li>
            </ul>
          </div>

          {/* Company links */}
          <div className={styles.footerCol}>
            <h4>Company</h4>
            <ul>
              <li><button onClick={onOpenAbout} style={{ background: 'none', border: 0, padding: 0, color: 'inherit', font: 'inherit', cursor: 'pointer' }}>About</button></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#privacy">Privacy</a></li>
              <li><a href="#terms">Terms</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom copyright bar & trust line */}
        <div className={styles.footerBottom}>
          <div>&copy; {new Date().getFullYear()} StorePilot. All rights reserved.</div>
          <div style={{ fontStyle: 'italic', color: '#89939F', fontSize: '0.75rem' }}>
            Built for store owners who want to run their business smarter.
          </div>
          <div className={styles.footerLinks}>
            <a href="#terms">Terms</a>
            <a href="#privacy">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
