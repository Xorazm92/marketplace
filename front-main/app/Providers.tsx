'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { ToastProvider } from '../components/common/Toast';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <ToastProvider maxToasts={5}>
        {children}
      </ToastProvider>
    </Provider>
  );
}