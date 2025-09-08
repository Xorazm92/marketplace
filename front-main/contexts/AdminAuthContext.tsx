import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { adminLogin, adminLogout, getAdminProfile } from '../endpoints/admin';
import { toast } from 'react-toastify';

interface AdminUser {
  id: number;
  email?: string;
  phone_number?: string;
  first_name: string;
  last_name: string;
  role: 'ADMIN' | 'MODERATOR' | 'SUPER_ADMIN';
  is_active: boolean;
  created_at: string;
}

interface AuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const adminData = await getAdminProfile();
        setAdmin(adminData);
      } catch (error) {
        console.error('Failed to load admin profile:', error);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    loadAdmin();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await adminLogin({ email, password });
      setAdmin(response.data.user);
      toast.success('Admin login successful!');
      router.push('/admin/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error?.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await adminLogout();
      setAdmin(null);
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    admin,
    loading,
    login,
    logout,
    isAuthenticated: !!admin,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {!loading && children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AuthContextType => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
