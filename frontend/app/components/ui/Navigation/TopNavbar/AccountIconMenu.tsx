'use client';

// next
import Link from 'next/link';
// react
import { useState, type ReactElement } from 'react';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/shadcn/dropdown-menu';
import { Button } from '@/app/components/ui/shadcn/button';
// icons
import { User } from 'lucide-react';
// components
import { ThemeToggle, Loader } from '@/app/components/ui/common';
// include
import { AccountSettingsModal } from '../AccountSettingsModal';
import { AccountMenuItems } from '../data';


export function AccountIconMenu(): ReactElement {

  const items                                       = AccountMenuItems();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant   = 'ghost'
                size      = 'icon'
                className = '[&_svg]:size-6'>
          <User />
          <span className='sr-only'>User menu</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='mt-2 w-64 bg-sidebar px-0 py-2'>
        {items.map((item, idx) => {
          if (item.type === 'loading') {
            return <div key={`${item.key}-${idx}`}><Loader /></div>;
          } else if (item.type === 'divided') {
            return <div key={`${item.key}-${idx}`} className={cn('my-2','h-[1px] w-full rounded-full bg-border',)} />;
          } else {
            return (
              <DropdownMenuItem key={item.key} asChild>
                {(item.key === 'settings') ? (
                  <Button variant   = 'ghost'
                          key       = {item.key}
                          onClick   = {() => setIsAccountModalOpen(true)}
                          className = {cn(
                            'w-full h-8 px-4 justify-start rounded-none',
                            'text-xs font-light text-foreground',
                            'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                            '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',
                            'focus-visible:ring-0',
                            'cursor-pointer',)}>
                    {item.icon && <item.icon />}{item.label}
                  </Button>
                ) : ( (item.type === 'action' && item.onClick) ? (
                  <Button variant   = 'ghost'
                          key       = {item.key}
                          onClick   = {item.onClick}
                          className = {cn(
                            'w-full h-8 px-4 justify-start rounded-none',
                            'text-xs font-light text-foreground',
                            'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                            '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',
                            'focus-visible:ring-0',
                            'cursor-pointer',)}>
                    {item.icon && <item.icon />}{item.label}
                  </Button>
                ) : (
                  <Link key       = {item.key}
                        href      = {item.href ?? '#'}
                        className = {cn(
                          'w-full h-8 px-4 rounded-none',
                          'text-xs font-light text-foreground text-left',
                          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                          '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',
                          'cursor-pointer',)}>
                    {item.icon && <item.icon />}{item.label}
                  </Link>
                ))}
              </DropdownMenuItem>
            );
          };
        })}

        <div className={cn('my-2','h-[1px] w-full rounded-full bg-border',)} />

        {/* ThemeToggle */}
        <div className = {cn(
          'relative flex justify-between cursor-default select-none items-center gap-2 ',
          'text-xs font-light text-foreground text-left',
          'px-4 outline-none',
        )}>
          <span>Appearance</span>
          <ThemeToggle />
        </div>

      </DropdownMenuContent>

      {/* アカウント設定 モーダル */}
      <AccountSettingsModal open         = {isAccountModalOpen}
                            onOpenChange = {setIsAccountModalOpen} />

    </DropdownMenu>
  );
};