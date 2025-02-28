// react
import type { ReactNode,  ReactElement } from 'react';
// providers
import { AuthProvider } from '@/app/providers';

// AuthLayout ▽
export default function AuthLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};
// AuthLayout △