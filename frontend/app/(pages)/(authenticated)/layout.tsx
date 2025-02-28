// react
import type { ReactNode, ReactElement } from 'react';
// wrappers
import { AuthRedirectForUnauthenticated, SidebarWrapper } from '@/app/wrappers';
// providers
import { AuthProvider } from '@/app/providers';


// AuthenticatedLayout ▽
export default function AuthenticatedLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <AuthProvider>
      <AuthRedirectForUnauthenticated>
        <SidebarWrapper>
          {children}
        </SidebarWrapper>
      </AuthRedirectForUnauthenticated>
    </AuthProvider>
  );
};
// AuthenticatedLayout △