import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import ProductManagement from '../../components/admin/ProductManagement';

const AdminProductsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Admin - Product Management | INBOLA</title>
        <meta name="description" content="Admin product management dashboard" />
      </Head>
      
      <div style={{ padding: '20px' }}>
        <h1>Product Management</h1>
        <ProductManagement />
      </div>
    </>
  );
};

export default AdminProductsPage;
