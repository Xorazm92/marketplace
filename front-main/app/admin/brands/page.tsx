'use client';

import React from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { withAdminAuth } from '../../../hooks/useAdminAuth';
import BrandManagement from '../../../components/admin/BrandManagement';

function AdminBrandsPage() {
  return (
    <AdminLayout activeTab="products">
      <BrandManagement />
    </AdminLayout>
  );
}

export default withAdminAuth(AdminBrandsPage);
