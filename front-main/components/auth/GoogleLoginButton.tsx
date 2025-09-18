import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import styles from './GoogleLoginButton.module.scss';

interface GoogleLoginButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  text?: string;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onClick,
  disabled = false,
  text = "Google orqali kirish"
}) => {
  const handleGoogleLogin = () => {
    if (onClick) {
      onClick();
    } else {
      // Default behavior: redirect to backend Google OAuth endpoint
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      window.location.href = `${backendUrl}/api/v1/auth/google`;
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={disabled}
      className={`${styles.googleButton} ${disabled ? styles.disabled : ''}`}
    >
      <FcGoogle className={styles.googleIcon} />
      <span className={styles.buttonText}>{text}</span>
    </button>
  );
};

export default GoogleLoginButton;
