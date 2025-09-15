'use client';

import React from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { withAdminAuth } from '../../../hooks/useAdminAuth';

function AdminSettingsPage() {
  return (
    <AdminLayout activeTab="settings">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Tizim sozlamalari</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p>Tizim sozlamalari va konfiguratsiya paneli</p>
        </div>
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(AdminSettingsPage);
