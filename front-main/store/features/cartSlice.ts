import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../../endpoints/cart';

// Cart Item interface
export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    title: string;
    price: number;
    images: string[];
    brand?: {
      name: string;
    };
  };
}

// Cart State interface
export interface CartState {
  items: CartItem[];
  total_amount: number;
  total_items: number;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: CartState = {
  items: [],
  total_amount: 0,
  total_items: 0,
  loading: false,
  error: null,
};

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCart();
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Savatchani yuklashda xatolik');
    }
  }
);

export const addProductToCart = createAsyncThunk(
  'cart/addProduct',
  async ({ productId, quantity = 1 }: { productId: number; quantity?: number }, { rejectWithValue }) => {
    try {
      const response = await addToCart(productId, quantity);
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Savatchaga qo\'shishda xatolik');
    }
  }
);

export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateItem',
  async ({ cartItemId, quantity }: { cartItemId: number; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await updateCartItem(cartItemId, quantity);
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Savatchani yangilashda xatolik');
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async (cartItemId: number, { rejectWithValue }) => {
    try {
      const response = await removeFromCart(cartItemId);
      return { cartItemId, ...response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Mahsulotni olib tashlashda xatolik');
    }
  }
);

export const clearCartItems = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await clearCart();
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Savatchani tozalashda xatolik');
    }
  }
);

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Local cart management (for non-authenticated users)
    addToLocalCart: (state, action: PayloadAction<{ product: any; quantity: number }>) => {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find(item => item.product_id === product.id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        const newItem: CartItem = {
          id: Date.now(), // Temporary ID for local storage
          product_id: product.id,
          quantity,
          price: product.price,
          product: {
            id: product.id,
            title: product.title,
            price: product.price,
            images: product.images || [],
            brand: product.brand,
          },
        };
        state.items.push(newItem);
      }
      
      // Recalculate totals
      state.total_items = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.total_amount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    
    updateLocalCartItem: (state, action: PayloadAction<{ productId: number; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.product_id === productId);
      
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.product_id !== productId);
        } else {
          item.quantity = quantity;
        }
        
        // Recalculate totals
        state.total_items = state.items.reduce((sum, item) => sum + item.quantity, 0);
        state.total_amount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }
    },
    
    removeFromLocalCart: (state, action: PayloadAction<number>) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.product_id !== productId);
      
      // Recalculate totals
      state.total_items = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.total_amount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    
    clearLocalCart: (state) => {
      state.items = [];
      state.total_items = 0;
      state.total_amount = 0;
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch cart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.total_amount = action.payload.total_amount || 0;
        state.total_items = action.payload.total_items || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Add to cart
    builder
      .addCase(addProductToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProductToCart.fulfilled, (state, action) => {
        state.loading = false;
        // Refresh cart after adding
        if (action.payload.items) {
          state.items = action.payload.items;
          state.total_amount = action.payload.total_amount || 0;
          state.total_items = action.payload.total_items || 0;
        }
      })
      .addCase(addProductToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Update cart item
    builder
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.items) {
          state.items = action.payload.items;
          state.total_amount = action.payload.total_amount || 0;
          state.total_items = action.payload.total_items || 0;
        }
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Remove cart item
    builder
      .addCase(removeCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.loading = false;
        // Remove item from local state
        state.items = state.items.filter(item => item.id !== action.meta.arg);
        // Recalculate totals
        state.total_items = state.items.reduce((sum, item) => sum + item.quantity, 0);
        state.total_amount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Clear cart
    builder
      .addCase(clearCartItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCartItems.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.total_amount = 0;
        state.total_items = 0;
      })
      .addCase(clearCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  addToLocalCart,
  updateLocalCartItem,
  removeFromLocalCart,
  clearLocalCart,
  clearError,
} = cartSlice.actions;

export default cartSlice.reducer;

// Selectors
export const selectCart = (state: { cart: CartState }) => state.cart;
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartTotal = (state: { cart: CartState }) => state.cart.total_amount;
export const selectCartItemCount = (state: { cart: CartState }) => state.cart.total_items;
export const selectCartLoading = (state: { cart: CartState }) => state.cart.loading;
export const selectCartError = (state: { cart: CartState }) => state.cart.error;
