import React from 'react';
import Link from 'next/link';

const PaymentCancelPage = () => {
  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold text-red-600">To'lov bekor qilindi</h1>
      <p className="mt-2">Siz to'lov jarayonini bekor qildingiz. Xaridlarni davom ettirishingiz mumkin.</p>
      <Link href="/" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">
        Bosh sahifaga qaytish
      </Link>
    </div>
  );
};

export default PaymentCancelPage;
