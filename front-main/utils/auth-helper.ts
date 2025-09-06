// Authentication helper utilities

/**
 * Get access token from localStorage
 */
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
};

/**
 * Get user data from localStorage
 */
export const getUserData = (): any | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  const user = getUserData();
  return !!(token && user);
};

/**
 * Save authentication data to localStorage
 */
export const saveAuthData = (token: string, refreshToken: string, user: any): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('accessToken', token);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user_data', JSON.stringify(user));
};

/**
 * Clear authentication data from localStorage
 */
export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user_data');
};

/**
 * Get authorization header for API requests
 */
export const getAuthHeader = (): { Authorization: string } | {} => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Check if token is expired (basic check)
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true; // If we can't parse, assume expired
  }
};

/**
 * Auto-logout if token is expired
 */
export const checkTokenExpiry = (): boolean => {
  const token = getAccessToken();
  
  if (!token) return false;
  
  if (isTokenExpired(token)) {
    clearAuthData();
    return false;
  }
  
  return true;
};

export default {
  getAccessToken,
  getRefreshToken,
  getUserData,
  isAuthenticated,
  saveAuthData,
  clearAuthData,
  getAuthHeader,
  isTokenExpired,
  checkTokenExpiry,
};
