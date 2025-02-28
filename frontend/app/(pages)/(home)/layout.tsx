// react
import type { ReactNode, ReactElement } from 'react';
// providers
import { AuthProvider } from '@/app/providers';
// components
import { ScrollToTopButton } from '@/app/components/ui/common';
// wrappers
import { NavbarWrapper } from '@/app/wrappers';


// HomeLayout ▽
export default function HomeLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <AuthProvider>
      <NavbarWrapper>
        {children}
      </NavbarWrapper>
      <ScrollToTopButton />
    </AuthProvider>
  );
};
// HomeLayout △