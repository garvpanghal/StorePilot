import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../api/api';
import styles from '../styles/onboarding.module.css';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const STEPS = [
  {
    title: "Welcome to StorePilot 👋",
    body: "Your workspace is ready. Let's take a quick tour so you can get familiar with everything StorePilot can do.",
    target: null,
  },
  {
    title: "Your Dashboard",
    body: "Get a quick overview of your store's sales, inventory health, and important business metrics.",
    target: "dashboard",
    preferredAlign: "right",
  },
  {
    title: "Inventory",
    body: "Track your stock levels and quickly identify products that are running low.",
    target: "inventory",
    preferredAlign: "right",
  },
  {
    title: "Products",
    body: "Add and manage the products you sell. Product information is used throughout your inventory, sales, and reporting workflows.",
    target: "products",
    preferredAlign: "right",
  },
  {
    title: "Sales",
    body: "Record and review sales transactions and keep track of your store's revenue.",
    target: "sales",
    preferredAlign: "right",
  },
  {
    title: "Purchases",
    body: "Track purchases and stock coming into your business.",
    target: "purchases",
    preferredAlign: "right",
  },
  {
    title: "Suppliers",
    body: "Keep supplier information organized so you can manage your purchasing workflow more efficiently.",
    target: "suppliers",
    preferredAlign: "right",
  },
  {
    title: "Reports",
    body: "Analyze your store's performance using reports and visualizations.",
    target: "reports",
    preferredAlign: "right",
  },
  {
    title: "Stay informed",
    body: "StorePilot can notify you about important events such as low-stock alerts and purchase updates.",
    target: "notifications",
    preferredAlign: "bottom",
  },
  {
    title: "Your Store Settings",
    body: "Manage your profile, business information, preferences, notifications, and account settings.",
    target: "settings",
    preferredAlign: "right",
  },
  {
    title: "You're ready! 🚀",
    body: "Your StorePilot workspace is ready to go. Start by adding your first product.",
    target: null,
  }
];

export default function OnboardingTour() {
  const { user, updateOnboardingState } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlight, setSpotlight] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ left: 0, top: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const tooltipRef = useRef(null);

  // Handle window resizing to toggle mobile state
  useEffect(() => {
    if (!user || user.onboarding_completed) return;
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [user]);

  // Update spotlight and tooltip positions on changes
  useLayoutEffect(() => {
    if (!user || user.onboarding_completed) return;
    const step = STEPS[currentStep];
    if (!step || !step.target) {
      setSpotlight(null);
      return;
    }

    // Determine target selector. On mobile, sidebar items are hidden: fallback to mobile-menu
    let selector = `[data-tour="${step.target}"]`;
    if (isMobile && ["dashboard", "inventory", "products", "sales", "purchases", "suppliers", "reports", "settings"].includes(step.target)) {
      selector = '[data-tour="mobile-menu"]';
    }

    const updatePosition = () => {
      const el = document.querySelector(selector);
      if (!el) {
        setSpotlight(null);
        return;
      }

      const rect = el.getBoundingClientRect();
      // If element is hidden (collapsed sidebar settings or others might return 0 width/height)
      if (rect.width === 0 && rect.height === 0) {
        setSpotlight(null);
        return;
      }

      // Add a slight padding around the spotlight target
      const pad = 6;
      const spot = {
        x: rect.left - pad,
        y: rect.top - pad,
        width: rect.width + (pad * 2),
        height: rect.height + (pad * 2),
      };
      setSpotlight(spot);

      // Tooltip position calculation
      if (isMobile) {
        // Mobile style is fixed bottom, positioned via CSS
        return;
      }

      const tooltipEl = tooltipRef.current;
      const tWidth = tooltipEl ? tooltipEl.offsetWidth : 320;
      const tHeight = tooltipEl ? tooltipEl.offsetHeight : 180;
      const gap = 12;

      let left = 0;
      let top = 0;

      if (step.preferredAlign === "right") {
        left = spot.x + spot.width + gap;
        top = spot.y + (spot.height / 2) - (tHeight / 2);
      } else if (step.preferredAlign === "bottom") {
        left = spot.x + (spot.width / 2) - (tWidth / 2);
        top = spot.y + spot.height + gap;
      } else if (step.preferredAlign === "top") {
        left = spot.x + (spot.width / 2) - (tWidth / 2);
        top = spot.y - tHeight - gap;
      } else {
        // default center
        left = window.innerWidth / 2 - tWidth / 2;
        top = window.innerHeight / 2 - tHeight / 2;
      }

      // Viewport safety boundaries (min 16px margins)
      left = Math.max(16, Math.min(window.innerWidth - tWidth - 16, left));
      top = Math.max(16, Math.min(window.innerHeight - tHeight - 16, top));

      setTooltipPos({ left, top });
    };

    updatePosition();

    // Attach resize & scroll listeners to recalculate spotlight targets
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    // Setup an interval to poll position changes (e.g. layout shift, routes navigation transition)
    const timer = setInterval(updatePosition, 100);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      clearInterval(timer);
    };
  }, [currentStep, isMobile, user]);

  // Navigate to target route if needed for step
  useEffect(() => {
    if (!user || user.onboarding_completed) return;
    const step = STEPS[currentStep];
    if (step && step.target && !isMobile) {
      const sidebarRoutes = {
        dashboard: "/dashboard",
        inventory: "/inventory",
        products: "/products",
        sales: "/sales",
        purchases: "/purchases",
        suppliers: "/suppliers",
        reports: "/reports",
        settings: "/settings",
      };
      const path = sidebarRoutes[step.target];
      if (path && window.location.pathname !== path) {
        navigate(path);
      }
    }
  }, [currentStep, isMobile, navigate, user]);

  // Keyboard navigation support
  useEffect(() => {
    if (!user || user.onboarding_completed) return;
    const handleKeys = (e) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [currentStep, user]);

  // Stop rendering if user has completed onboarding or doesn't exist
  if (!user || user.onboarding_completed) {
    return null;
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    try {
      await usersAPI.updateOnboarding(true);
      updateOnboardingState(true);
    } catch (err) {
      console.error("Failed to skip tour", err);
      // Fallback update frontend local state anyway to avoid locking the user
      updateOnboardingState(true);
    }
  };

  const handleFinish = async () => {
    try {
      await usersAPI.updateOnboarding(true);
      updateOnboardingState(true);
    } catch (err) {
      console.error("Failed to complete tour", err);
      updateOnboardingState(true);
    }
  };

  const currentStepData = STEPS[currentStep];
  const isIntro = currentStep === 0;
  const isOutro = currentStep === STEPS.length - 1;

  return (
    <>
      {/* Dimmed Overlay with Spotlight transparent hole */}
      <svg className={styles.spotlightSvg}>
        <defs>
          <mask id="onboarding-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlight && (
              <rect
                className={styles.spotlightMaskRect}
                x={spotlight.x}
                y={spotlight.y}
                width={spotlight.width}
                height={spotlight.height}
                rx="8"
                ry="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          className={styles.dimmer}
          width="100%"
          height="100%"
          mask="url(#onboarding-spotlight-mask)"
        />
      </svg>

      {/* Tooltip Card */}
      <div
        ref={tooltipRef}
        className={`${styles.tooltipCard} ${
          (isIntro || isOutro) ? styles.centeredCard : (isMobile ? styles.mobileBottomCard : '')
        }`}
        style={(!isIntro && !isOutro && !isMobile) ? { left: `${tooltipPos.left}px`, top: `${tooltipPos.top}px` } : {}}
        role="dialog"
        aria-labelledby="tour-step-title"
        aria-describedby="tour-step-body"
      >
        <h3 id="tour-step-title" className={styles.tooltipTitle}>
          {currentStepData.title}
        </h3>
        <p id="tour-step-body" className={styles.tooltipBody}>
          {currentStepData.body}
        </p>

        {isIntro ? (
          <div className={`${styles.tooltipFooter} ${styles.centeredActions}`}>
            <button className={`${styles.btn} ${styles.primaryBtn}`} onClick={handleNext}>
              Start Tour
            </button>
            <button className={`${styles.btn} ${styles.secondaryBtn}`} onClick={handleSkip}>
              Skip Tour
            </button>
          </div>
        ) : isOutro ? (
          <div className={`${styles.tooltipFooter} ${styles.centeredActions}`}>
            <button className={`${styles.btn} ${styles.primaryBtn}`} onClick={handleFinish}>
              Get Started <Check size={16} />
            </button>
          </div>
        ) : (
          <div className={styles.tooltipFooter}>
            <div className={styles.tooltipProgress}>
              {currentStep} of {STEPS.length - 2}
            </div>
            <div className={styles.tooltipActions}>
              <button 
                className={`${styles.btn} ${styles.linkBtn}`} 
                onClick={handleSkip}
                style={{ marginRight: '8px' }}
              >
                Skip
              </button>
              <button
                className={`${styles.btn} ${styles.secondaryBtn}`}
                onClick={handlePrev}
                disabled={currentStep === 1}
                aria-label="Previous step"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <button
                className={`${styles.btn} ${styles.primaryBtn}`}
                onClick={handleNext}
                aria-label="Next step"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
