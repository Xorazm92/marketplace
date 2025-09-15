'use client';

import React from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { withAdminAuth } from '../../../hooks/useAdminAuth';
import ProductManagement from '../../../components/admin/ProductManagement';

function AdminProductsPage() {
  return (
    <AdminLayout activeTab="products">
      <ProductManagement />
    </AdminLayout>
  );
}

export default withAdminAuth(AdminProductsPage);
