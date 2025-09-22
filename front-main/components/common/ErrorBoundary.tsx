'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';
import styles from './ErrorBoundary.module.scss';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Here you could send error to logging service
      // logErrorToService(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className={styles.errorBoundary}>
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>
              <FaExclamationTriangle />
            </div>
            
            <h2 className={styles.errorTitle}>
              Nimadir noto'g'ri ketdi
            </h2>
            
            <p className={styles.errorMessage}>
              Sahifani yuklashda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className={styles.errorDetails}>
                <summary>Texnik ma'lumotlar</summary>
                <pre className={styles.errorStack}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className={styles.errorActions}>
              <button
                onClick={this.handleRetry}
                className={styles.retryButton}
              >
                <FaRedo />
                Qaytadan urinish
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className={styles.reloadButton}
              >
                Sahifani yangilash
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for functional components
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Simple error fallback components
export const SimpleErrorFallback: React.FC<{ error?: Error; retry?: () => void }> = ({ 
  error, 
  retry 
}) => (
  <div className={styles.simpleError}>
    <p>Xatolik yuz berdi</p>
    {retry && (
      <button onClick={retry} className={styles.simpleRetry}>
        Qaytadan urinish
      </button>
    )}
  </div>
);

export const ProductErrorFallback: React.FC = () => (
  <div className={styles.productError}>
    <FaExclamationTriangle />
    <span>Mahsulotni yuklashda xatolik</span>
  </div>
);

export const CategoryErrorFallback: React.FC = () => (
  <div className={styles.categoryError}>
    <FaExclamationTriangle />
    <span>Kategoriyani yuklashda xatolik</span>
  </div>
);

export default ErrorBoundary;
