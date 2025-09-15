'use client';

import React from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { withAdminAuth } from '../../../hooks/useAdminAuth';

function AdminOrdersPage() {
  return (
    <AdminLayout activeTab="orders">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Buyurtmalar boshqaruvi</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p>Buyurtmalar ro'yxati va boshqaruv paneli</p>
        </div>
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(AdminOrdersPage);
