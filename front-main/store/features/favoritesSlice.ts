import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Favorite Product interface
export interface FavoriteProduct {
  id: number;
  title: string;
  price: number;
  images: string[];
  brand?: {
    name: string;
  };
  addedAt: string;
}

// Favorites State interface
export interface FavoritesState {
  items: FavoriteProduct[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: FavoritesState = {
  items: [],
  loading: false,
  error: null,
};

// Favorites slice
const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    // Add to favorites
    addToFavorites: (state, action: PayloadAction<any>) => {
      const product = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);
      
      if (!existingItem) {
        const favoriteProduct: FavoriteProduct = {
          id: product.id,
          title: product.title,
          price: product.price,
          images: product.images || [],
          brand: product.brand,
          addedAt: new Date().toISOString(),
        };
        state.items.unshift(favoriteProduct); // Add to beginning
      }
    },
    
    // Remove from favorites
    removeFromFavorites: (state, action: PayloadAction<number>) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.id !== productId);
    },
    
    // Toggle favorite
    toggleFavorite: (state, action: PayloadAction<any>) => {
      const product = action.payload;
      const existingIndex = state.items.findIndex(item => item.id === product.id);
      
      if (existingIndex >= 0) {
        // Remove if exists
        state.items.splice(existingIndex, 1);
      } else {
        // Add if doesn't exist
        const favoriteProduct: FavoriteProduct = {
          id: product.id,
          title: product.title,
          price: product.price,
          images: product.images || [],
          brand: product.brand,
          addedAt: new Date().toISOString(),
        };
        state.items.unshift(favoriteProduct);
      }
    },
    
    // Clear all favorites
    clearFavorites: (state) => {
      state.items = [];
    },
    
    // Load favorites from localStorage
    loadFavoritesFromStorage: (state, action: PayloadAction<FavoriteProduct[]>) => {
      state.items = action.payload;
    },
    
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
  clearFavorites,
  loadFavoritesFromStorage,
  setLoading,
  setError,
} = favoritesSlice.actions;

export default favoritesSlice.reducer;

// Selectors
export const selectFavorites = (state: { favorites: FavoritesState }) => state.favorites;
export const selectFavoriteItems = (state: { favorites: FavoritesState }) => state.favorites.items;
export const selectFavoriteCount = (state: { favorites: FavoritesState }) => state.favorites.items.length;
export const selectIsFavorite = (productId: number) => (state: { favorites: FavoritesState }) => 
  state.favorites.items.some(item => item.id === productId);

// Helper functions for localStorage
export const saveFavoritesToStorage = (favorites: FavoriteProduct[]) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }
};

export const loadFavoritesFromStorageHelper = (): FavoriteProduct[] => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('favorites');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
      return [];
    }
  }
  return [];
};
