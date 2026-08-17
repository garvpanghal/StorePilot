import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/landing.module.css';

export default function LandingNavbar({ onOpenAbout }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navContainerRef = useRef(null);

  // Close drawer on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleNavigationToDashboard = () => {
    navigate(user ? '/dashboard' : '/login');
  };

  return (
    <header className={styles.navbarOuter} ref={navContainerRef}>
      <div className={`${styles.container} ${styles.navbar}`}>
        <div className={styles.navLogo} onClick={() => navigate('/')}>
          <img src="/assets/logo-light.png" alt="StorePilot" />
        </div>

        <div className={styles.navActions}>
          <button onClick={onOpenAbout} className={styles.navLinkBtn}>
            About
          </button>
          
          {user ? (
            <button onClick={handleNavigationToDashboard} className={styles.trialBtn}>
              Open StorePilot <ArrowRight size={14} />
            </button>
          ) : (
            <>
              <RouterLink to="/login" className={styles.signInBtn}>Sign In</RouterLink>
              <RouterLink to="/login" className={styles.trialBtn}>
                Open StorePilot <ArrowRight size={14} />
              </RouterLink>
            </>
          )}

          <button 
            className={styles.menuToggle} 
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className={styles.mobileMenuDrawer}>
          <button 
            onClick={() => { setMobileOpen(false); onOpenAbout(); }} 
            className={styles.mobileMenuLink}
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 0 }}
          >
            About StorePilot
          </button>
          
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {user ? (
              <button 
                onClick={() => { setMobileOpen(false); handleNavigationToDashboard(); }} 
                className={styles.trialBtn} 
                style={{ justifyContent: 'center' }}
              >
                Open StorePilot
              </button>
            ) : (
              <>
                <RouterLink to="/login" onClick={() => setMobileOpen(false)} className={styles.signInBtn} style={{ textAlign: 'center' }}>Sign In</RouterLink>
                <RouterLink to="/login" onClick={() => setMobileOpen(false)} className={styles.trialBtn} style={{ justifyContent: 'center' }}>Open StorePilot</RouterLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
