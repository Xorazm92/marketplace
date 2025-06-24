import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { CartItem, Product } from '@shared/schema';

interface CartContextType {
  items: (CartItem & { product: Product })[];
  addToCart: (productId: number, quantity: number, variantId?: string) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['/api/cart'],
    enabled: isAuthenticated,
    retry: false,
  });

  const items = cartData?.items || [];

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity, variantId }: { productId: number; quantity: number; variantId?: string }) => {
      await apiRequest('POST', '/api/cart/items', {
        productId,
        quantity,
        variantId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      await apiRequest('PUT', `/api/cart/items/${itemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest('DELETE', `/api/cart/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      // Remove all items individually since we don't have a clear cart endpoint
      await Promise.all(items.map(item => 
        apiRequest('DELETE', `/api/cart/items/${item.id}`)
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const addToCart = async (productId: number, quantity: number, variantId?: string) => {
    if (!isAuthenticated) {
      throw new Error('Please log in to add items to cart');
    }
    await addToCartMutation.mutateAsync({ productId, quantity, variantId });
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    await updateQuantityMutation.mutateAsync({ itemId, quantity });
  };

  const removeFromCart = async (itemId: number) => {
    await removeFromCartMutation.mutateAsync(itemId);
  };

  const clearCart = async () => {
    await clearCartMutation.mutateAsync();
  };

  const getTotalItems = (): number => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = (): number => {
    return items.reduce((total, item) => {
      const price = parseFloat(item.product.price.toString());
      return total + (price * item.quantity);
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalItems,
        getTotalPrice,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
