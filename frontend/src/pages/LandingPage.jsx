import React, { useEffect, useState } from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroContent from '../components/landing/HeroContent';
import DashboardPreview from '../components/landing/DashboardPreview';
import FeatureStrip from '../components/landing/FeatureStrip';
import AboutModal from '../components/landing/AboutModal';
import styles from '../styles/landing.module.css';

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(null);
  const [demoTrigger, setDemoTrigger] = useState(0);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  useEffect(() => {
    document.title = "StorePilot | Your store. Has a signal.";
  }, []);

  const handleHoverFeature = (featureId) => {
    setActiveFeature(featureId);
  };

  const handleWatchDemo = () => {
    setDemoTrigger(prev => prev + 1);
  };

  return (
    <div className={styles.landingWrap}>
      {/* Background patterns */}
      <svg className={styles.radialBackground} viewBox="0 0 800 800" aria-hidden="true">
        <circle cx="400" cy="400" r="180" className={styles.bgCircle} />
        <circle cx="400" cy="400" r="300" className={styles.bgCircle} />
        
        {/* Pulsing data dots */}
        <circle r="2.5" className={styles.dataPulse}>
          <animateMotion 
            path="M 400 220 A 180 180 0 1 1 399 220 Z" 
            dur="12s" 
            repeatCount="indefinite" 
          />
        </circle>
        <circle r="3.5" className={styles.dataPulse}>
          <animateMotion 
            path="M 400 100 A 300 300 0 1 0 401 100 Z" 
            dur="18s" 
            repeatCount="indefinite" 
          />
        </circle>
      </svg>

      <LandingNavbar onOpenAbout={() => setIsAboutOpen(true)} />

      <main className={`${styles.container} ${styles.heroContainer}`}>
        {/* Hero columns */}
        <HeroContent onClickWatchDemo={handleWatchDemo} />
        
        <DashboardPreview 
          activeFeature={activeFeature} 
          demoTrigger={demoTrigger}
        />
      </main>

      <div className={styles.bottomStripOuter}>
        <FeatureStrip 
          onHoverFeature={handleHoverFeature} 
          activeFeature={activeFeature}
        />
      </div>

      <div className={styles.trustStatement}>
        <span className={styles.trustIcon}>◇</span> Built for store owners who want to run their business smarter.
      </div>

      {/* About Modal */}
      <AboutModal 
        isOpen={isAboutOpen} 
        onClose={() => setIsAboutOpen(false)} 
      />
    </div>
  );
}
