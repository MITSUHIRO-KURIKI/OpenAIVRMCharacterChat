'use client';

// next-auth
import { SessionProvider } from 'next-auth/react';
// react
import { type ReactNode, type ReactElement } from 'react';

// AuthProvider
export function AuthProvider({ children }: {children: ReactNode}): ReactElement {
  return <SessionProvider>{children}</SessionProvider>;
};