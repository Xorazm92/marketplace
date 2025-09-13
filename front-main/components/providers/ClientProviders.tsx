'use client';

import { SessionProvider } from '@/components/providers/SessionProvider';
import { Toaster } from 'react-hot-toast';
import { ReactNode } from 'react';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster position="top-right" />
    </SessionProvider>
  );
}
