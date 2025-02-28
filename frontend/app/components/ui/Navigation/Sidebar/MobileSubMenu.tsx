'use client';

// next
import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
// react
import {
  type ReactElement,
  type MouseEvent,
} from 'react';
// shadcn/ui
import { cn } from '@/app/components/lib/shadcn';
import { Button } from '@/app/components/ui/shadcn/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/app/components/ui/shadcn/dropdown-menu';
// icons
import {
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
// features
import { UrlToString } from '@/features/utils';
// type
import type { MenuContentProps } from './type.d';


// MobileSubMenu ▽
export function MobileSubMenu({
  title,
  createButtonLabel,
  roomRootPath,
  isSending,
  items,
  handleLoadMoreItems,
  handleCreateItem,
  handleItemNameEditModal,
  handleDeleteItemModal,
  setIsMobileMenuOpen, }: MenuContentProps): ReactElement {

  const pathname = usePathname();

  return (
  <>
    <div className={cn(
      'flex gap-2 mb-2 justify-start items-center',
      'text-xs font-light text-foreground select-none',
      '[&>svg]:text-foreground',)}>
      {title}
    </div>
    <Button size      = 'sm'
            className = 'absolute right-4 top-4 text-xs'
            disabled  = {isSending}
            onClick   = {(e: MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              e.stopPropagation();
              handleCreateItem({setIsMobileMenuOpen});
            }}>
      {isSending ? <Loader2 className='animate-spin' /> : createButtonLabel}
    </Button>
    <ul className='ml-2 w-full space-y-2 pr-8'>
      { items.map((subItem) => {
        const isActive = pathname?.includes(String(subItem.href));
        return (
          <li key={subItem.key}>
            <div className='flex w-full items-center justify-between'>
              <Link href      = {UrlToString(roomRootPath.$url({_roomId:subItem.href ?? ''}))}
                    className = {cn(
                      'flex w-full h-8 justify-start items-center rounded',
                      'text-sm font-normal text-foreground select-none',
                      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',)}
                    onClick = {() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} >
                {subItem.label ?? ''}
              </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon'>
                      <MoreVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick = {(e: MouseEvent<HTMLElement>) => {
                      e.stopPropagation();
                      handleItemNameEditModal({
                        roomId:      subItem.key,
                        currentName: subItem.label,
                      });
                    }} >
                      <Pencil />Title change
                    </DropdownMenuItem>
                    <DropdownMenuItem className = {cn(
                                        'text-destructive',
                                        'hover:bg-destructive hover:text-destructive-foreground',
                                        'focus:bg-destructive focus:text-destructive-foreground',)}
                                      onClick = {(e: MouseEvent<HTMLElement>) => {
                                        e.stopPropagation();
                                        handleDeleteItemModal({roomId: subItem.key});
                                      }} >
                      <Trash2 />delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </li>
        );
      })}
    </ul>
    <Button variant   = 'ghost'
            className = 'mt-3 text-xs text-foreground/60'
            disabled  = {isSending}
            onClick   = {(e: MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              e.stopPropagation();
              handleLoadMoreItems();
            }}>
            {isSending ? <Loader2 className='animate-spin' /> : 'load more'}
    </Button>
  </>
  );
};
// MobileSubMenu △