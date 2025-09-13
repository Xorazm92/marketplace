
import { useState, useEffect, useCallback } from 'react';
import { apiInstance } from '../endpoints/instance';

interface CartItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    title: string;
    price: number;
    product_image: Array<{ url: string }>;
  };
}

interface Cart {
  id: number;
  items: CartItem[];
  total_amount: number;
  items_count: number;
}

export const useCart = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing saved cart:', error);
        localStorage.removeItem('cart');
      }
    }
    fetchCart();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiInstance.get('/cart');
      setCart(response.data);
    } catch (error: any) {
      if (error.response?.status !== 401) {
        setError('Error loading cart');
        console.error('Error fetching cart:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (productId: number, quantity: number = 1) => {
    try {
      setLoading(true);
      const response = await apiInstance.post('/cart/add', {
        productId,
        quantity
      });
      
      setCart(response.data);
      setError(null);
      
      // Show success notification
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('cart-updated', {
          detail: { type: 'add', productId, quantity }
        });
        window.dispatchEvent(event);
      }
    } catch (error: any) {
      setError('Error adding to cart');
      console.error('Error adding to cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCartItem = useCallback(async (itemId: number, quantity: number) => {
    try {
      setLoading(true);
      
      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }
      
      const response = await apiInstance.put(`/cart/update/${itemId}`, {
        quantity
      });
      
      setCart(response.data);
      setError(null);
    } catch (error: any) {
      setError('Error updating cart');
      console.error('Error updating cart:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFromCart = useCallback(async (itemId: number) => {
    try {
      setLoading(true);
      await apiInstance.delete(`/cart/remove/${itemId}`);
      
      // Update cart by removing the item locally
      setCart(prevCart => {
        if (!prevCart) return null;
        
        const updatedItems = prevCart.items.filter(item => item.id !== itemId);
        const totalAmount = updatedItems.reduce((sum, item) => 
          sum + (item.product.price * item.quantity), 0
        );
        
        return {
          ...prevCart,
          items: updatedItems,
          total_amount: totalAmount,
          items_count: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        };
      });
      
      setError(null);
    } catch (error: any) {
      setError('Error removing from cart');
      console.error('Error removing from cart:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      await apiInstance.delete('/cart/clear');
      setCart(null);
      localStorage.removeItem('cart');
      setError(null);
    } catch (error: any) {
      setError('Error clearing cart');
      console.error('Error clearing cart:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCartCount = useCallback(() => {
    return cart?.items_count || 0;
  }, [cart]);

  const getTotalPrice = useCallback(() => {
    return cart?.total_amount || 0;
  }, [cart]);

  return {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartCount,
    getTotalPrice,
    refreshCart: fetchCart
  };
};
