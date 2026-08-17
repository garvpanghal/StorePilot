import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import styles from '../../styles/landing.module.css';

export default function AboutModal({ isOpen, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className={styles.modalOverlay} 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-title"
    >
      <div 
        className={styles.modalContent} 
        onClick={e => e.stopPropagation()}
        ref={modalRef}
      >
        <div className={styles.modalHeader}>
          <h3 id="about-title">About StorePilot</h3>
          <button 
            onClick={onClose} 
            className={styles.modalCloseBtn}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <p>
            <strong>StorePilot</strong> is an intelligent operating system designed for modern independent retailers, groceries, and wholesale supply stores.
          </p>
          <p>
            By consolidating inventory replenishment, point-of-sale invoicing, purchase workflows, and business reports into a unified workspace, StorePilot turns daily logs into clear business forecasts.
          </p>
          <p>
            With integrated <strong>AI Assistant capabilities</strong>, store operators can query stock valuation or weekly velocity trends using natural conversation.
          </p>
        </div>
      </div>
    </div>
  );
}
