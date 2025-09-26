import React, { createContext, useContext, useState, useEffect } from 'react';
import { getWishlistCount } from '@/services/wishlistService';
import { requestPermission, getNotificationCount } from '@/services/notificationService';

interface EcommerceContextType {
  wishlistCount: number;
  cartCount: number;
  isAuthenticated: boolean;
  refreshCounts: () => void;
}

const EcommerceContext = createContext<EcommerceContextType | undefined>(undefined);

export const useEcommerce = () => {
  const context = useContext(EcommerceContext);
  if (!context) {
    throw new Error('useEcommerce must be used within an EcommerceProvider');
  }
  return context;
};

export const EcommerceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistCount, setWishlistCountState] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const refreshCounts = async () => {
    try {
      const count = await getWishlistCount();
      setWishlistCountState(count);
      
      const notificationCount = await getNotificationCount();
      console.log('Notification count:', notificationCount);
      
      const cart = JSON.parse(localStorage.getItem('inbola_cart') || '[]');
      setCartCount(cart.length);
    } catch (error) {
      console.error('Error refreshing counts:', error);
    }
  };

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    refreshCounts();
    requestPermission();
  }, []);

  return (
    <EcommerceContext.Provider value={{
      wishlistCount,
      cartCount,
      isAuthenticated,
      refreshCounts
    }}>
      {children}
    </EcommerceContext.Provider>
  );
};

export default EcommerceProvider;
