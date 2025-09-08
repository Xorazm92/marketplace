'use client';

import { useState } from 'react';
import OrderList from '@/components/OrderManagement/OrderList';

export default function OrdersPage() {
  return (
    <div className="container mx-auto p-6">
      <OrderList />
    </div>
  );
}
