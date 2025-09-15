'use client';

import React from 'react';
import { AdminDashboard } from '../../components/admin/AdminDashboard';
import AdminLayout from '../../components/admin/AdminLayout';
import { withAdminAuth } from '../../hooks/useAdminAuth';

function AdminPage() {
  return (
    <AdminLayout activeTab="dashboard">
      <AdminDashboard />
    </AdminLayout>
  );
}

export default withAdminAuth(AdminPage);
