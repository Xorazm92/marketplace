/**
 * Unified Cart System - Handles both localStorage and API seamlessly
 * Provides consistent cart functionality across all pages
 */

export interface CartItem {
  id: number;
  product_id: number;
  title: string;
  price: string | number;
  quantity: number;
  image: string;
  currency?: { symbol: string };
  variant?: any;
  created_at?: string;
  updated_at?: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_amount: number;
  total_items: number;
  currency?: string;
}

export interface LocalCartItem {
  id: number;
  title: string;
  price: string | number;
  image: string;
  quantity: number;
  variant?: any;
  added_at?: string;
}

class CartManager {
  private static instance: CartManager;
  private cartKey = 'inbola_cart';
  private isAuthenticated = false;

  private constructor() {
    this.checkAuthentication();
    this.setupAuthListener();
  }

  static getInstance(): CartManager {
    if (!CartManager.instance) {
      CartManager.instance = new CartManager();
    }
    return CartManager.instance;
  }

  private checkAuthentication(): void {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      this.isAuthenticated = !!token;
    }
  }

  private setupAuthListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'accessToken') {
          this.checkAuthentication();
        }
      });
    }
  }

  /**
   * Add item to cart - automatically chooses between localStorage and API
   */
  async addItem(item: Omit<LocalCartItem, 'id' | 'added_at'>): Promise<{ success: boolean; message: string }> {
    try {
      if (this.isAuthenticated) {
        // Use API for authenticated users
        return await this.addItemToAPI(item);
      } else {
        // Use localStorage for guests
        return this.addItemToLocalStorage(item);
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return { success: false, message: 'Savatchaga qo\'shishda xatolik yuz berdi' };
    }
  }

  /**
   * Get cart items - automatically chooses between localStorage and API
   */
  async getCart(): Promise<Cart> {
    if (this.isAuthenticated) {
      return await this.getCartFromAPI();
    } else {
      return this.getCartFromLocalStorage();
    }
  }

  /**
   * Update item quantity
   */
  async updateQuantity(cartItemId: number, quantity: number): Promise<{ success: boolean; message: string }> {
    if (this.isAuthenticated) {
      return await this.updateQuantityInAPI(cartItemId, quantity);
    } else {
      return this.updateQuantityInLocalStorage(cartItemId, quantity);
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem(cartItemId: number): Promise<{ success: boolean; message: string }> {
    if (this.isAuthenticated) {
      return await this.removeItemFromAPI(cartItemId);
    } else {
      return this.removeItemFromLocalStorage(cartItemId);
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<{ success: boolean; message: string }> {
    if (this.isAuthenticated) {
      return await this.clearCartFromAPI();
    } else {
      return this.clearCartFromLocalStorage();
    }
  }

  /**
   * Get cart item count for header display
   */
  async getCartItemCount(): Promise<number> {
    try {
      const cart = await this.getCart();
      return cart.total_items || 0;
    } catch (error) {
      console.error('Error getting cart count:', error);
      return 0;
    }
  }

  // ===== LOCAL STORAGE METHODS =====

  private addItemToLocalStorage(item: Omit<LocalCartItem, 'id' | 'added_at'>): { success: boolean; message: string } {
    if (typeof window === 'undefined') {
      return { success: false, message: 'Browser environment required' };
    }

    try {
      const existingCart = JSON.parse(localStorage.getItem(this.cartKey) || '[]');

      // Check if item already exists
      const existingItemIndex = existingCart.findIndex((cartItem: LocalCartItem) => cartItem.title === item.title);

      if (existingItemIndex > -1) {
        // Update quantity
        existingCart[existingItemIndex].quantity += item.quantity;
      } else {
        // Add new item
        const newItem: LocalCartItem = {
          ...item,
          id: Date.now(), // Simple ID generation
          added_at: new Date().toISOString()
        };
        existingCart.push(newItem);
      }

      localStorage.setItem(this.cartKey, JSON.stringify(existingCart));
      return { success: true, message: 'Mahsulot savatchaga qo\'shildi!' };
    } catch (error) {
      console.error('Error adding to localStorage:', error);
      return { success: false, message: 'localStorage xatoligi' };
    }
  }

  private getCartFromLocalStorage(): Cart {
    if (typeof window === 'undefined') {
      return this.getEmptyCart();
    }

    try {
      const items: LocalCartItem[] = JSON.parse(localStorage.getItem(this.cartKey) || '[]');
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = items.reduce((sum, item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        return sum + (price * item.quantity);
      }, 0);

      return {
        id: 1, // Mock ID for localStorage cart
        items: items.map(item => ({
          id: item.id,
          product_id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          variant: item.variant
        })),
        total_amount: totalAmount,
        total_items: totalItems,
        currency: 'UZS'
      };
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return this.getEmptyCart();
    }
  }

  private updateQuantityInLocalStorage(cartItemId: number, quantity: number): { success: boolean; message: string } {
    if (typeof window === 'undefined') {
      return { success: false, message: 'Browser environment required' };
    }

    try {
      const existingCart = JSON.parse(localStorage.getItem(this.cartKey) || '[]');
      const itemIndex = existingCart.findIndex((item: LocalCartItem) => item.id === cartItemId);

      if (itemIndex > -1) {
        if (quantity <= 0) {
          existingCart.splice(itemIndex, 1);
        } else {
          existingCart[itemIndex].quantity = quantity;
        }
        localStorage.setItem(this.cartKey, JSON.stringify(existingCart));
        return { success: true, message: 'Miqdor yangilandi' };
      }

      return { success: false, message: 'Mahsulot topilmadi' };
    } catch (error) {
      console.error('Error updating localStorage:', error);
      return { success: false, message: 'localStorage xatoligi' };
    }
  }

  private removeItemFromLocalStorage(cartItemId: number): { success: boolean; message: string } {
    if (typeof window === 'undefined') {
      return { success: false, message: 'Browser environment required' };
    }

    try {
      const existingCart = JSON.parse(localStorage.getItem(this.cartKey) || '[]');
      const filteredCart = existingCart.filter((item: LocalCartItem) => item.id !== cartItemId);

      localStorage.setItem(this.cartKey, JSON.stringify(filteredCart));
      return { success: true, message: 'Mahsulot olib tashlandi' };
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return { success: false, message: 'localStorage xatoligi' };
    }
  }

  private clearCartFromLocalStorage(): { success: boolean; message: string } {
    if (typeof window === 'undefined') {
      return { success: false, message: 'Browser environment required' };
    }

    try {
      localStorage.removeItem(this.cartKey);
      return { success: true, message: 'Savatcha tozalandi' };
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return { success: false, message: 'localStorage xatoligi' };
    }
  }

  private getEmptyCart(): Cart {
    return {
      id: 0,
      items: [],
      total_amount: 0,
      total_items: 0,
      currency: 'UZS'
    };
  }

  // ===== API METHODS =====

  private async addItemToAPI(item: Omit<LocalCartItem, 'id' | 'added_at'>): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          product_id: item.id,
          quantity: item.quantity,
          variant: item.variant
        })
      });

      if (response.ok) {
        return { success: true, message: 'Mahsulot savatchaga qo\'shildi!' };
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Error adding to API:', error);
      return { success: false, message: 'API xatoligi' };
    }
  }

  private async getCartFromAPI(): Promise<Cart> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Error fetching from API:', error);
      return this.getEmptyCart();
    }
  }

  private async updateQuantityInAPI(cartItemId: number, quantity: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/items/${cartItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ quantity })
      });

      if (response.ok) {
        return { success: true, message: 'Miqdor yangilandi' };
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Error updating API:', error);
      return { success: false, message: 'API xatoligi' };
    }
  }

  private async removeItemFromAPI(cartItemId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/items/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        return { success: true, message: 'Mahsulot olib tashlandi' };
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Error removing from API:', error);
      return { success: false, message: 'API xatoligi' };
    }
  }

  private async clearCartFromAPI(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        return { success: true, message: 'Savatcha tozalandi' };
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Error clearing API:', error);
      return { success: false, message: 'API xatoligi' };
    }
  }
}

// Export singleton instance
export const cartManager = CartManager.getInstance();

// Export convenience functions
export const addToCart = (item: Omit<LocalCartItem, 'id' | 'added_at'>) => cartManager.addItem(item);
export const getCart = () => cartManager.getCart();
export const updateCartItem = (cartItemId: number, quantity: number) => cartManager.updateQuantity(cartItemId, quantity);
export const removeFromCart = (cartItemId: number) => cartManager.removeItem(cartItemId);
export const clearCart = () => cartManager.clearCart();
export const getCartItemCount = () => cartManager.getCartItemCount();
