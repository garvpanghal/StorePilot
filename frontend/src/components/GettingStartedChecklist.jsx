import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../api/api';
import styles from '../styles/onboarding.module.css';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react';

export default function GettingStartedChecklist() {
  const { user } = useAuth();
  const location = useLocation();

  const [checklist, setChecklist] = useState({
    store_setup: false,
    add_product: false,
    add_supplier: false,
    record_purchase: false,
    record_sale: false,
  });

  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load state from localStorage on mount/user change
  useEffect(() => {
    if (!user) return;

    const collapsedKey = `storepilot-checklist-collapsed-${user.id}`;
    const dismissedKey = `storepilot-checklist-dismissed-${user.id}`;

    setCollapsed(localStorage.getItem(collapsedKey) === 'true');
    setDismissed(localStorage.getItem(dismissedKey) === 'true');
  }, [user]);

  // Fetch checklist status from backend
  const fetchChecklistStatus = async () => {
    if (!user || user.onboarding_completed === false) return;
    try {
      const status = await usersAPI.getChecklist();
      if (status) {
        setChecklist(status);
      }
    } catch (err) {
      console.error("Failed to fetch checklist status", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch checklist status on route changes, user changes, and periodic polling (every 15s)
  useEffect(() => {
    fetchChecklistStatus();

    const interval = setInterval(fetchChecklistStatus, 15000);
    return () => clearInterval(interval);
  }, [user, location.pathname]);

  if (!user || !user.onboarding_completed || dismissed) {
    return null;
  }

  const handleToggleCollapse = () => {
    const nextCollapsed = !collapsed;
    setCollapsed(nextCollapsed);
    if (user) {
      localStorage.setItem(`storepilot-checklist-collapsed-${user.id}`, String(nextCollapsed));
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    if (user) {
      localStorage.setItem(`storepilot-checklist-dismissed-${user.id}`, 'true');
    }
  };

  const items = [
    { key: 'store_setup', label: 'Set up your store information' },
    { key: 'add_product', label: 'Add your first product' },
    { key: 'add_supplier', label: 'Add your suppliers' },
    { key: 'record_purchase', label: 'Record your first purchase' },
    { key: 'record_sale', label: 'Record your first sale' },
  ];

  const completedCount = items.filter(item => checklist[item.key]).length;
  const isAllCompleted = completedCount === items.length;

  if (collapsed) {
    return (
      <div 
        className={`${styles.checklistWidget} ${styles.collapsedWidget}`}
        onClick={handleToggleCollapse}
      >
        <div className={styles.collapsedBar}>
          <div className={styles.collapsedLabel}>
            <span>📋 Getting Started</span>
          </div>
          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
            {completedCount}/{items.length}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checklistWidget} role="complementary" aria-label="Getting Started Checklist">
      <div className={styles.checklistHeader}>
        <h3>Getting Started ({completedCount}/{items.length})</h3>
        <div className={styles.headerControls}>
          <button 
            className={styles.controlBtn} 
            onClick={handleToggleCollapse}
            title="Minimize"
            aria-label="Minimize checklist"
          >
            <ChevronDown size={14} />
          </button>
          <button 
            className={styles.controlBtn} 
            onClick={handleDismiss}
            title="Dismiss permanently"
            aria-label="Dismiss checklist permanently"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className={styles.checklistBody}>
        {items.map(item => {
          const isDone = checklist[item.key];
          return (
            <div 
              key={item.key} 
              className={`${styles.checklistItem} ${isDone ? styles.checklistItemCompleted : styles.checklistItemActive}`}
            >
              <div className={styles.checkboxContainer}>
                <div className={`${styles.checkboxIcon} ${isDone ? styles.checkboxChecked : ''}`}>
                  {isDone && <Check size={10} strokeWidth={3} />}
                </div>
              </div>
              <span>{item.label}</span>
            </div>
          );
        })}

        {isAllCompleted && (
          <div className={styles.checklistCompletionMessage}>
            🎉 You're all set!
          </div>
        )}
      </div>
    </div>
  );
}
