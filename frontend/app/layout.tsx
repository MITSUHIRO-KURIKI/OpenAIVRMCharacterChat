// metadata
import { metadataConfig, viewportConfig } from './metadataConfig';
export const metadata = metadataConfig;
export const viewport = viewportConfig;
// react
import type { ReactNode, ReactElement } from 'react';
// head
import Head from './head';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
// providers
import { ThemeProvider, ToastProvider } from '@/app/providers';
// css
import '@/styles/base/globals.css';


// RootLayout ▽
export default function RootLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <html lang='en' dir='ltr'>
      <Head />
      <body className={cn('min-h-svh bg-background antialiased',
                          'font-body',)} >
        <ThemeProvider attribute    = 'class'
                       defaultTheme = 'system'
                       storageKey   = "site-theme"
                       enableSystem
                       disableTransitionOnChange >
          <ToastProvider />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
};
// RootLayout △