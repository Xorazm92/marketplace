import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand: string;
  ageRange?: string;
  stock: number;
  product_image: Array<{
    id: number;
    url: string;
    product_id: number;
  }>;
  features?: string[];
  specifications?: Record<string, string>;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
  is_active: boolean;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      // Safe processing of products to ensure category is always a string
      state.products = action.payload.map((product: any) => ({
        ...product,
        id: product.id || 0,
        title: String(product.title || 'Mahsulot'),
        description: String(product.description || ''),
        price: Number(product.price || 0),
        originalPrice: Number(product.originalPrice || product.price || 0),
        category: typeof product.category === 'object'
          ? String(product.category?.name || product.category?.title || 'Kategoriya')
          : String(product.category || 'Kategoriya'),
        brand: String(product.brand || 'Brand'),
        ageRange: String(product.ageRange || ''),
        stock: Number(product.stock || 0),
        product_image: Array.isArray(product.product_image) ? product.product_image : [],
        features: Array.isArray(product.features) ? product.features : [],
        specifications: typeof product.specifications === 'object' ? product.specifications : {},
        status: product.status || 'active',
        createdAt: String(product.createdAt || new Date().toISOString()),
        updatedAt: String(product.updatedAt || new Date().toISOString()),
        is_active: Boolean(product.is_active !== false)
      }));
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      // Safe processing of new product
      const safeProduct = {
        ...action.payload,
        id: action.payload.id || Date.now(),
        title: String(action.payload.title || 'Mahsulot'),
        description: String(action.payload.description || ''),
        price: Number(action.payload.price || 0),
        originalPrice: Number(action.payload.originalPrice || action.payload.price || 0),
        category: typeof action.payload.category === 'object'
          ? String((action.payload.category as any)?.name || (action.payload.category as any)?.title || 'Kategoriya')
          : String(action.payload.category || 'Kategoriya'),
        brand: String(action.payload.brand || 'Brand'),
        ageRange: String(action.payload.ageRange || ''),
        stock: Number(action.payload.stock || 0),
        product_image: Array.isArray(action.payload.product_image) ? action.payload.product_image : [],
        features: Array.isArray(action.payload.features) ? action.payload.features : [],
        specifications: typeof action.payload.specifications === 'object' ? action.payload.specifications : {},
        status: action.payload.status || 'active',
        createdAt: String(action.payload.createdAt || new Date().toISOString()),
        updatedAt: String(action.payload.updatedAt || new Date().toISOString()),
        is_active: Boolean(action.payload.is_active !== false)
      };
      state.products.unshift(safeProduct);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        // Safe processing of updated product
        const safeProduct = {
          ...action.payload,
          id: action.payload.id,
          title: String(action.payload.title || 'Mahsulot'),
          description: String(action.payload.description || ''),
          price: Number(action.payload.price || 0),
          originalPrice: Number(action.payload.originalPrice || action.payload.price || 0),
          category: typeof action.payload.category === 'object'
            ? String((action.payload.category as any)?.name || (action.payload.category as any)?.title || 'Kategoriya')
            : String(action.payload.category || 'Kategoriya'),
          brand: String(action.payload.brand || 'Brand'),
          ageRange: String(action.payload.ageRange || ''),
          stock: Number(action.payload.stock || 0),
          product_image: Array.isArray(action.payload.product_image) ? action.payload.product_image : [],
          features: Array.isArray(action.payload.features) ? action.payload.features : [],
          specifications: typeof action.payload.specifications === 'object' ? action.payload.specifications : {},
          status: action.payload.status || 'active',
          createdAt: String(action.payload.createdAt || new Date().toISOString()),
          updatedAt: String(action.payload.updatedAt || new Date().toISOString()),
          is_active: Boolean(action.payload.is_active !== false)
        };
        state.products[index] = safeProduct;
      }
    },
    deleteProduct: (state, action: PayloadAction<number>) => {
      state.products = state.products.filter(p => p.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  setLoading,
  setError,
} = productSlice.actions;

export default productSlice.reducer;
