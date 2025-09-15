'use client';

import React from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { withAdminAuth } from '../../../hooks/useAdminAuth';

function AdminAnalyticsPage() {
  return (
    <AdminLayout activeTab="analytics">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Hisobotlar va statistika</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p>Analitika va hisobotlar paneli</p>
        </div>
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(AdminAnalyticsPage);
