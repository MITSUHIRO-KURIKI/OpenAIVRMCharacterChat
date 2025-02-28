'use client';

// next
import Link from 'next/link';
// react
import type { ReactElement } from 'react';
// pagesPath
import { pagesPath } from '@/features/paths/frontend';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
// hooks
import { useTopNavbarVisibility } from '../hooks';
// include
import { NavigationMenu } from './NavigationMenu';
import { AccountIconMenu } from './AccountIconMenu';
import { MobileMenu } from './MobileMenu';
import { MobileMenuSidever } from '../Sidebar';


// type
type TopNavbarProps = {
  isUseSidebar?:  boolean;
  navbarBgColor?: string;
};

// TopNavbar ▽
export function TopNavbar({isUseSidebar, navbarBgColor}: TopNavbarProps): ReactElement {

  // useTopNavbarVisibility
  const { isTopNavBarVisible, setIsTopNavBarVisible } = useTopNavbarVisibility();

  return (
    <nav className={cn(
      'fixed z-fixed top-0 left-0 w-full h-[var(--navbar-height)]',
      'transition-transform duration-300',"ease-[cubic-bezier(0.32,0.72,0,1)]",
      'backdrop-blur-sm backdrop-filter',
      navbarBgColor ? navbarBgColor : 'bg-background/30 dark:bg-background/30',
      !isUseSidebar && 'border-b border-border',
      isTopNavBarVisible ? 'translate-y-0' : '-translate-y-full',)}>
      <div className='flex h-[var(--navbar-height)] w-full items-center'>

        {/* Logo */}
        <div className={cn(
          'flex-1 justify-start pl-2',
          'select-none',
          'md:flex-1 md:pl-8',)}>
          <Link href={pagesPath.$url()} className='font-bold'>
            {process.env.NEXT_PUBLIC_SITE_NAME as string}
          </Link>
        </div>

        {/* NavigationMenu */}
        { !isUseSidebar && (
          <div className={cn(
            'flex-none max-w-0 flex items-center justify-center',
            'invisible md:visible')}>
            <NavigationMenu />
          </div>
        )}

        {/* Right Button */}
        <div className={cn(
          'flex-2 flex justify-end pr-2',
          'md:flex-1 md:pr-8',)}>

          {/* AccountIconMenu */}
          <div className={cn(
            'hidden',
            'md:block')}>
            <AccountIconMenu />
          </div>

          {/* MobileMenu */}
          { !isUseSidebar ? (
            <MobileMenu setIsTopNavBarVisible = {setIsTopNavBarVisible}/>
          ) : (
            <MobileMenuSidever setIsTopNavBarVisible = {setIsTopNavBarVisible}/>
          )}
        </div>
      </div>
    </nav>
  );
};
// TopNavbar △