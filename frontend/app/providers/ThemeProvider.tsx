// Ref: https://github.com/shadcn-ui/ui/issues/5552#issuecomment-2435053678
'use client';

// next
import dynamic from 'next/dynamic';
// react
import { type ReactElement } from 'react';
// lib
import { type ThemeProviderProps } from 'next-themes';

// NextThemesProvider
const NextThemesProvider = dynamic(
  () => import('next-themes').then((e) => e.ThemeProvider),
  { ssr: false, }
);

// ThemeProvider
export function ThemeProvider({ children, ...props }: ThemeProviderProps): ReactElement {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
};