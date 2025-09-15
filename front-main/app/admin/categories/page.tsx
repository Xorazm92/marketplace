'use client';

import React from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { withAdminAuth } from '../../../hooks/useAdminAuth';
import CategoryManagement from '../../../components/admin/CategoryManagement';

function AdminCategoriesPage() {
  return (
    <AdminLayout activeTab="products">
      <CategoryManagement />
    </AdminLayout>
  );
}

export default withAdminAuth(AdminCategoriesPage);
