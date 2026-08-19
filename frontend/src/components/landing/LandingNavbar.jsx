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
        <>
          <div 
            className={styles.mobileDrawerBackdrop} 
            onClick={() => setMobileOpen(false)} 
          />
          <div className={`${styles.mobileDrawerPanel} ${mobileOpen ? styles.mobileDrawerPanelOpen : ''}`}>
            <div className={styles.mobileDrawerHeader}>
              <div className={styles.navLogo} onClick={() => { setMobileOpen(false); navigate('/'); }}>
                <img src="/assets/logo-light.png" alt="StorePilot" />
              </div>
              <button 
                className={styles.drawerCloseBtn} 
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            
            <nav className={styles.mobileDrawerNav}>
              <RouterLink to="/" onClick={() => setMobileOpen(false)} className={styles.mobileNavLink}>Home</RouterLink>
              <button 
                onClick={() => { setMobileOpen(false); onOpenAbout(); }} 
                className={styles.mobileNavLinkBtn}
              >
                Features & About
              </button>
              
              <div className={styles.mobileNavDivider} />
              
              {user ? (
                <button 
                  onClick={() => { setMobileOpen(false); handleNavigationToDashboard(); }} 
                  className={styles.mobileNavBtnPrimary}
                >
                  Open Dashboard
                </button>
              ) : (
                <>
                  <RouterLink to="/login" onClick={() => setMobileOpen(false)} className={styles.mobileNavLinkAccent}>Sign In</RouterLink>
                  <RouterLink to="/login" onClick={() => setMobileOpen(false)} className={styles.mobileNavBtnPrimary}>Get Started</RouterLink>
                </>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
