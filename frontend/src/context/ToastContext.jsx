import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }, [dismissToast]);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} style={{ color: 'var(--primary)' }} />;
      case 'warning':
        return <AlertTriangle size={16} style={{ color: 'var(--warning)' }} />;
      case 'error':
        return <AlertOctagon size={16} style={{ color: 'var(--danger)' }} />;
      default:
        return <Info size={16} style={{ color: 'var(--info)' }} />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div className="toastContainer" aria-live="assertive" aria-atomic="true">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast toast${t.type.charAt(0).toUpperCase() + t.type.slice(1)}`}
            role="alert"
          >
            <span className="toastIcon">{getIcon(t.type)}</span>
            <div className="toastMessage">{t.message}</div>
            <button
              onClick={() => dismissToast(t.id)}
              className="toastClose"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
