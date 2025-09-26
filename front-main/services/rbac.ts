import { apiClient } from '@/lib/api-client';

export interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  isActive: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface KycVerification {
  id: string;
  userId: string;
  type: 'personal' | 'business';
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  passportNumber?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  taxId?: string;
  businessLicense?: string;
  companyName?: string;
  companyAddress?: string;
  passportPhoto?: string;
  selfieWithPassport?: string;
  businessLicensePhoto?: string;
  taxCertificatePhoto?: string;
  rejectionReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  deviceInfo: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  isActive: boolean;
  expiresAt: string;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export const rbacApi = {
  // Role Management
  getRoles: () => apiClient.get<Role[]>('/rbac/roles'),
  
  createRole: (data: {
    name: string;
    description: string;
    permissions: string[];
    isActive?: boolean;
  }) => apiClient.post<Role>('/rbac/roles', data),
  
  updateRole: (name: string, data: Partial<Role>) =>
    apiClient.put<Role>(`/rbac/roles/${name}`, data),
  
  deleteRole: (name: string) => apiClient.delete(`/rbac/roles/${name}`),

  // User Role Management
  assignRole: (userId: string, roleName: string) =>
    apiClient.post(`/rbac/users/${userId}/roles`, { roleName }),
  
  getUserPermissions: (userId: string) =>
    apiClient.get<string[]>(`/rbac/users/${userId}/permissions`),
  
  getUserRoles: (userId: string) => apiClient.get<Role>(`/rbac/users/${userId}/roles`),

  // KYC Verification
  submitPersonalKyc: (data: FormData) =>
    apiClient.post<KycVerification>('/rbac/kyc/personal', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  submitBusinessKyc: (data: FormData) =>
    apiClient.post<KycVerification>('/rbac/kyc/business', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  getKycStatus: () => apiClient.get<KycVerification>('/rbac/kyc/status'),
  
  getKycVerifications: (params?: { status?: string }) =>
    apiClient.get<KycVerification[]>('/rbac/kyc/verifications', { params }),
  
  approveKyc: (id: string) => apiClient.post(`/rbac/kyc/${id}/approve`),
  
  rejectKyc: (id: string, reason: string) =>
    apiClient.post(`/rbac/kyc/${id}/reject`, { reason }),

  // Permission Checking
  checkPermission: (permission: string) =>
    apiClient.get<{ hasPermission: boolean }>(`/rbac/check/${permission}`),

  // Audit Logs
  getAuditLogs: (params?: {
    userId?: string;
    action?: string;
    resource?: string;
    page?: number;
    limit?: number;
  }) => apiClient.get<{ logs: AuditLog[]; pagination: any }>('/rbac/audit-logs', { params }),

  // Session Management
  getSessions: () => apiClient.get<Session[]>('/rbac/sessions'),
  
  revokeSession: (id: string) => apiClient.delete(`/rbac/sessions/${id}`),

  // Password Policy
  getPasswordPolicy: () => apiClient.get('/rbac/password-policy'),
  
  updatePasswordPolicy: (policy: any) => apiClient.put('/rbac/password-policy', policy),
};

// Role-based hooks
export const usePermissions = () => {
  const checkPermission = async (permission: string) => {
    try {
      const response = await rbacApi.checkPermission(permission);
      return response.hasPermission;
    } catch {
      return false;
    }
  };

  return { checkPermission };
};

// Permission-based component wrapper
export const PermissionWrapper = ({
  permission,
  fallback = null,
  children,
}: {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rbacApi.checkPermission(permission)
      .then(response => setHasPermission(response.hasPermission))
      .finally(() => setLoading(false));
  }, [permission]);

  if (loading) return <div>Yuklanmoqda...</div>;
  if (!hasPermission) return fallback;
  return children;
};
