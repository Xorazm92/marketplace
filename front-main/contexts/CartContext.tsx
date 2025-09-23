'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { toast } from 'react-toastify';
import {
  cartManager,
  Cart,
  CartItem,
  LocalCartItem,
  addToCart as addToCartUtil,
  getCart as getCartUtil,
  updateCartItem as updateCartItemUtil,
  removeFromCart as removeFromCartUtil,
  clearCart as clearCartUtil,
  getCartItemCount as getCartItemCountUtil
} from '../utils/cartManager';

interface CartContextState {
  cart: Cart;
  loading: boolean;
  itemCount: number;
}

interface CartContextActions {
  addItem: (item: Omit<LocalCartItem, 'id' | 'added_at'>) => Promise<void>;
  updateItemQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

type CartContextValue = CartContextState & CartContextActions;

const CartContext = createContext<CartContextValue | undefined>(undefined);

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: Cart }
  | { type: 'SET_ITEM_COUNT'; payload: number }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { id: number; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'CLEAR_CART' };

const cartReducer = (state: CartContextState, action: CartAction): CartContextState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_CART':
      return { ...state, cart: action.payload };

    case 'SET_ITEM_COUNT':
      return { ...state, itemCount: action.payload };

    case 'ADD_ITEM':
      const newItems = [...state.cart.items];
      const existingItemIndex = newItems.findIndex(item => item.id === action.payload.id);

      if (existingItemIndex > -1) {
        newItems[existingItemIndex].quantity += action.payload.quantity;
      } else {
        newItems.push(action.payload);
      }

      const newTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const newTotalAmount = newItems.reduce((sum, item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        return sum + (price * item.quantity);
      }, 0);

      return {
        ...state,
        cart: {
          ...state.cart,
          items: newItems,
          total_items: newTotalItems,
          total_amount: newTotalAmount
        }
      };

    case 'UPDATE_ITEM':
      const updatedItems = state.cart.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

      const updatedTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const updatedTotalAmount = updatedItems.reduce((sum, item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        return sum + (price * item.quantity);
      }, 0);

      return {
        ...state,
        cart: {
          ...state.cart,
          items: updatedItems,
          total_items: updatedTotalItems,
          total_amount: updatedTotalAmount
        }
      };

    case 'REMOVE_ITEM':
      const filteredItems = state.cart.items.filter(item => item.id !== action.payload);
      const filteredTotalItems = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
      const filteredTotalAmount = filteredItems.reduce((sum, item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        return sum + (price * item.quantity);
      }, 0);

      return {
        ...state,
        cart: {
          ...state.cart,
          items: filteredItems,
          total_items: filteredTotalItems,
          total_amount: filteredTotalAmount
        }
      };

    case 'CLEAR_CART':
      return {
        ...state,
        cart: {
          ...state.cart,
          items: [],
          total_items: 0,
          total_amount: 0
        }
      };

    default:
      return state;
  }
};

const initialState: CartContextState = {
  cart: {
    id: 0,
    items: [],
    total_amount: 0,
    total_items: 0,
    currency: 'UZS'
  },
  loading: false,
  itemCount: 0
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart on mount
  useEffect(() => {
    loadCart();
    loadCartCount();
  }, []);

  const loadCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const cart = await getCartUtil();
      dispatch({ type: 'SET_CART', payload: cart });
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadCartCount = async () => {
    try {
      const count = await getCartItemCountUtil();
      dispatch({ type: 'SET_ITEM_COUNT', payload: count });
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };

  const addItem = async (item: Omit<LocalCartItem, 'id' | 'added_at'>) => {
    try {
      const result = await addToCartUtil(item);

      if (result.success) {
        toast.success(result.message);
        await loadCart(); // Reload cart to get updated state
        await loadCartCount(); // Update count
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Savatchaga qo\'shishda xatolik');
    }
  };

  const updateItemQuantity = async (cartItemId: number, quantity: number) => {
    try {
      const result = await updateCartItemUtil(cartItemId, quantity);

      if (result.success) {
        dispatch({ type: 'UPDATE_ITEM', payload: { id: cartItemId, quantity } });
        await loadCartCount(); // Update count
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Miqdorni yangilashda xatolik');
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      const result = await removeFromCartUtil(cartItemId);

      if (result.success) {
        dispatch({ type: 'REMOVE_ITEM', payload: cartItemId });
        await loadCartCount(); // Update count
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Mahsulotni olib tashlashda xatolik');
    }
  };

  const clearCart = async () => {
    try {
      const result = await clearCartUtil();

      if (result.success) {
        dispatch({ type: 'CLEAR_CART' });
        dispatch({ type: 'SET_ITEM_COUNT', payload: 0 });
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Savatchani tozalashda xatolik');
    }
  };

  const refreshCart = async () => {
    await loadCart();
    await loadCartCount();
  };

  const contextValue: CartContextValue = {
    ...state,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    refreshCart
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
