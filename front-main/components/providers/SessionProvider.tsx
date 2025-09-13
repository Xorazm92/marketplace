'use client';

import { ReactNode } from 'react';

// No-op session provider while NextAuth is not configured
export function SessionProvider({ children }: { children: ReactNode }) {
  return children as any;
}
