// Shared types and utilities
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'parent' | 'child' | 'seller';
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  ageGroup: string;
}

export const API_ENDPOINTS = {
  AUTH: '/auth',
  USERS: '/users',
  PRODUCTS: '/products',
  ORDERS: '/orders',
} as const;

export const PAYMENT_METHODS = {
  CLICK: 'click',
  PAYME: 'payme',
  CASH: 'cash',
} as const;
