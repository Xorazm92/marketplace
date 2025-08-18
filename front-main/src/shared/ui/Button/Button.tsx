import React from 'react';
import './Button.css';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
}) => {
  const baseClass = 'btn';
  const variantClass = `btn--${variant}`;
  const sizeClass = `btn--${size}`;
  const widthClass = fullWidth ? 'btn--full-width' : '';
  const loadingClass = loading ? 'btn--loading' : '';
  const disabledClass = disabled || loading ? 'btn--disabled' : '';

  const buttonClass = [
    baseClass,
    variantClass,
    sizeClass,
    widthClass,
    loadingClass,
    disabledClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={buttonClass}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
    >
      {loading && <span className="btn__spinner" />}
      <span className="btn__content">{children}</span>
    </button>
  );
};
