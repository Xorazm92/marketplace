import React, { createContext, useContext, useState, useEffect } from 'react';
import wishlistService from '../../services/wishlistService';
import paymentService from '../../services/paymentService';
import addressService from '../../services/addressService';
import orderService from '../../services/orderService';
import notificationService from '../../services/notificationService';

interface EcommerceContextType {
  wishlistCount: number;
  cartCount: number;
  isAuthenticated: boolean;
  refreshCounts: () => void;
}

const EcommerceContext = createContext<EcommerceContextType | undefined>(undefined);

export const EcommerceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    // Load counts
    refreshCounts();
    
    // Request notification permission
    notificationService.requestPermission();
  }, []);

  const refreshCounts = async () => {
    try {
      const wishlist = await wishlistService.getWishlistCount(isAuthenticated);
      setWishlistCount(wishlist);
      
      const cart = JSON.parse(localStorage.getItem('inbola_cart') || '[]');
      setCartCount(cart.length);
    } catch (error) {
      console.error('Error refreshing counts:', error);
    }
  };

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

export const useEcommerce = () => {
  const context = useContext(EcommerceContext);
  if (!context) {
    throw new Error('useEcommerce must be used within EcommerceProvider');
  }
  return context;
};

export default EcommerceProvider;
