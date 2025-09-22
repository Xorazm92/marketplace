'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import styles from './Toast.module.scss';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  maxToasts = 5 
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      // Keep only maxToasts number of toasts
      return updated.slice(0, maxToasts);
    });

    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, clearAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className={styles.toastContainer}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <FaCheck className={styles.icon} />;
      case 'error':
        return <FaTimes className={styles.icon} />;
      case 'warning':
        return <FaExclamationTriangle className={styles.icon} />;
      case 'info':
        return <FaInfoCircle className={styles.icon} />;
      default:
        return <FaInfoCircle className={styles.icon} />;
    }
  };

  return (
    <div
      className={`${styles.toast} ${styles[toast.type]} ${
        isVisible ? styles.visible : ''
      } ${isExiting ? styles.exiting : ''}`}
    >
      <div className={styles.toastIcon}>
        {getIcon()}
      </div>
      
      <div className={styles.toastContent}>
        <div className={styles.toastTitle}>{toast.title}</div>
        {toast.message && (
          <div className={styles.toastMessage}>{toast.message}</div>
        )}
        {toast.action && (
          <button
            className={styles.toastAction}
            onClick={toast.action.onClick}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        className={styles.closeButton}
        onClick={handleClose}
        aria-label="Yopish"
      >
        <FaTimes />
      </button>
    </div>
  );
};

// Helper functions for common toast types
export const showSuccessToast = (addToast: ToastContextType['addToast']) => (
  title: string,
  message?: string
) => {
  addToast({
    type: 'success',
    title,
    message,
  });
};

export const showErrorToast = (addToast: ToastContextType['addToast']) => (
  title: string,
  message?: string
) => {
  addToast({
    type: 'error',
    title,
    message,
    duration: 7000, // Longer duration for errors
  });
};

export const showWarningToast = (addToast: ToastContextType['addToast']) => (
  title: string,
  message?: string
) => {
  addToast({
    type: 'warning',
    title,
    message,
  });
};

export const showInfoToast = (addToast: ToastContextType['addToast']) => (
  title: string,
  message?: string
) => {
  addToast({
    type: 'info',
    title,
    message,
  });
};
