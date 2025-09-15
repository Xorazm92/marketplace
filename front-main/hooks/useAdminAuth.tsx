import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../endpoints/instance';

interface AdminUser {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR';
}

interface UseAdminAuthReturn {
  admin: AdminUser | null;
  isLoading: boolean;
  loading: boolean; // Alias for isLoading for backward compatibility
  isAuthenticated: boolean;
  login: (token: string, adminData: AdminUser) => void;
  logout: () => void;
  checkPermission: (permission: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
}

// Role-based permissions mapping
const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    'view_dashboard', 'view_analytics', 'view_users', 'create_user', 'update_user', 
    'delete_user', 'block_user', 'view_products', 'create_product', 'update_product', 
    'delete_product', 'approve_product', 'reject_product', 'view_orders', 
    'update_order_status', 'cancel_order', 'refund_order', 'view_categories', 
    'create_category', 'update_category', 'delete_category', 'view_brands', 
    'create_brand', 'update_brand', 'delete_brand', 'view_reviews', 
    'moderate_reviews', 'delete_review', 'view_admins', 'create_admin', 
    'update_admin', 'delete_admin', 'assign_roles', 'view_settings', 
    'update_settings', 'manage_notifications', 'view_reports', 'export_data', 
    'view_chats', 'moderate_chats', 'view_payments', 'process_refunds'
  ],
  ADMIN: [
    'view_dashboard', 'view_analytics', 'view_users', 'update_user', 'block_user',
    'view_products', 'update_product', 'approve_product', 'reject_product',
    'view_orders', 'update_order_status', 'cancel_order', 'refund_order',
    'view_categories', 'create_category', 'update_category', 'view_brands',
    'create_brand', 'update_brand', 'view_reviews', 'moderate_reviews',
    'delete_review', 'view_settings', 'view_reports', 'view_chats',
    'moderate_chats', 'view_payments', 'process_refunds'
  ],
  MODERATOR: [
    'view_dashboard', 'view_users', 'view_products', 'approve_product',
    'reject_product', 'view_orders', 'update_order_status', 'view_categories',
    'view_brands', 'view_reviews', 'moderate_reviews', 'delete_review',
    'view_chats', 'moderate_chats'
  ]
};

export const useAdminAuth = (): UseAdminAuthReturn => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('admin_access_token');
      const adminData = localStorage.getItem('admin_user');

      if (!token || !adminData) {
        setIsLoading(false);
        return;
      }

      // Parse admin data
      const parsedAdmin = JSON.parse(adminData);
      
      // Only verify token if user has admin role - avoid 403 errors for regular users
      if (parsedAdmin.role && ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(parsedAdmin.role)) {
        // Verify token with backend - use a simple endpoint that just checks auth
        const response = await fetch(`${API_BASE_URL}/api/v1/admin/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setAdmin(parsedAdmin);
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem('admin_access_token');
          localStorage.removeItem('admin_user');
          setAdmin(null);
        }
      } else {
        // User doesn't have admin role, clear admin data
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_user');
        setAdmin(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Clear invalid data
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_user');
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (token: string, adminData: AdminUser) => {
    localStorage.setItem('admin_access_token', token);
    localStorage.setItem('admin_user', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('admin_access_token');
      
      if (token) {
        // Call logout endpoint
        await fetch(`${API_BASE_URL}/api/v1/admin/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_user');
      setAdmin(null);
      
      // Redirect to login
      router.push('/admin/login');
      toast.success('Muvaffaqiyatli tizimdan chiqdingiz');
    }
  };

  const checkPermission = (permission: string): boolean => {
    if (!admin) return false;
    
    const rolePermissions = ROLE_PERMISSIONS[admin.role] || [];
    return rolePermissions.includes(permission);
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!admin) return false;
    
    if (Array.isArray(role)) {
      return role.includes(admin.role);
    }
    
    return admin.role === role;
  };

  const isAuthenticated = !!admin;

  return {
    admin,
    isLoading,
    loading: isLoading, // Alias for backward compatibility
    isAuthenticated,
    login,
    logout,
    checkPermission,
    hasRole,
  };
};

// Higher-order component for protecting admin routes
export const withAdminAuth = (WrappedComponent: React.ComponentType<any>) => {
  return function AuthenticatedComponent(props: any) {
    const { isAuthenticated, isLoading } = useAdminAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.replace('/admin/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px',
          color: '#666'
        }}>
          Yuklanmoqda...
        </div>
      );
    }

    if (!isAuthenticated) {
      return null; // Will redirect to login
    }

    return <WrappedComponent {...props} />;
  };
};

// Permission-based component wrapper
interface RequirePermissionProps {
  permission: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RequirePermission: React.FC<RequirePermissionProps> = ({
  permission,
  children,
  fallback = <div>Ruxsat yo'q</div>
}) => {
  const { checkPermission } = useAdminAuth();

  const hasPermission = Array.isArray(permission)
    ? permission.some(p => checkPermission(p))
    : checkPermission(permission);

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

// Role-based component wrapper
interface RequireRoleProps {
  role: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RequireRole: React.FC<RequireRoleProps> = ({
  role,
  children,
  fallback = <div>Ruxsat yo'q</div>
}) => {
  const { hasRole } = useAdminAuth();

  return hasRole(role) ? <>{children}</> : <>{fallback}</>;
};
