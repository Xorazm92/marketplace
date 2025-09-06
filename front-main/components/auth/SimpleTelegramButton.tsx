"use client";

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FiSend } from 'react-icons/fi';

interface SimpleTelegramButtonProps {
  onSuccess?: (userData: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

const SimpleTelegramButton: React.FC<SimpleTelegramButtonProps> = ({ 
  onSuccess, 
  onError, 
  className = "" 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleTelegramLogin = async () => {
    setIsLoading(true);
    
    try {
      // Simulate Telegram login for now
      // In production, this would integrate with actual Telegram widget
      const mockTelegramData = {
        id: Math.floor(Math.random() * 1000000),
        first_name: 'Test User',
        auth_date: Math.floor(Date.now() / 1000),
        hash: 'mock_hash_' + Date.now()
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/telegram/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockTelegramData),
      });

      const result = await response.json();
      
      if (result.success && result.token) {
        // Save tokens to localStorage
        localStorage.setItem('accessToken', result.token);
        localStorage.setItem('refreshToken', result.refreshToken);
        localStorage.setItem('user_data', JSON.stringify(result.user));
        
        toast.success('Telegram orqali muvaffaqiyatli kirildi!');
        onSuccess?.(result);
        
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        throw new Error(result.error || 'Telegram authentication failed');
      }
    } catch (error: any) {
      console.error('Telegram auth error:', error);
      const errorMessage = error.message || 'Telegram orqali kirish xatoligi';
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className} style={{ width: '100%', marginTop: '8px' }}>
      <button
        onClick={handleTelegramLogin}
        disabled={isLoading}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '14px 16px',
          backgroundColor: isLoading ? '#93c5fd' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          minHeight: '54px'
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = '#2563eb';
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = '#3b82f6';
          }
        }}
      >
        {isLoading ? (
          <div 
            style={{
              width: '20px',
              height: '20px',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              borderTopColor: '#fff',
              animation: 'spin 1s linear infinite'
            }}
          />
        ) : (
          <FiSend style={{ fontSize: '18px' }} />
        )}
        <span>
          {isLoading ? 'Kirilmoqda...' : 'Telegram orqali kirish'}
        </span>
      </button>
      
      <div style={{ 
        marginTop: '8px', 
        fontSize: '12px', 
        color: '#6b7280', 
        textAlign: 'center' as const 
      }}>
        <p style={{ margin: 0 }}>
          Telegram orqali kirishda siz bizning{' '}
          <a 
            href="/privacy" 
            style={{ color: '#2563eb', textDecoration: 'none' }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            Maxfiylik siyosati
          </a>{' '}
          va{' '}
          <a 
            href="/terms" 
            style={{ color: '#2563eb', textDecoration: 'none' }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            Foydalanish shartlari
          </a>
          ga rozilik bildirasiz.
        </p>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default SimpleTelegramButton;
