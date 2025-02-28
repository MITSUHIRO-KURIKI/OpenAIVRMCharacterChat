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
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/app/components/ui/shadcn/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/app/components/ui/shadcn/collapsible';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/app/components/ui/shadcn/dropdown-menu';
import { Button } from '@/app/components/ui/shadcn/button';
// icons
import {
  Loader2,
  ChevronRight,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
// features
import { UrlToString } from '@/features/utils';
// type
import type { MenuContentProps } from './type.d';


// SidebarContent ▽
export function SidebarContent({
  title,
  titleIcon: TitleIcon,
  createButtonLabel,
  roomRootPath,
  isSending,
  items,
  handleLoadMoreItems,
  handleCreateItem,
  handleItemNameEditModal,
  handleDeleteItemModal, }: MenuContentProps): ReactElement {

  const pathname = usePathname();

  return (
    <Collapsible title     = {title}
                 defaultOpen
                 className = 'group/collapsible'>
      <SidebarGroup>
        <SidebarGroupLabel asChild
                           className={cn(
                            'group/label',
                            'text-sm text-sidebar-foreground',
                            'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                          )}>
          <CollapsibleTrigger>
            { TitleIcon && <TitleIcon className='mx-2 size-4' />}{title}
            <ChevronRight className={cn(
                            'ml-auto transition-transform',
                            'group-data-[state=open]/collapsible:rotate-90',
                          )} />
          </CollapsibleTrigger>
        </SidebarGroupLabel>

        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu className='ml-2'>

              <Button size      = 'sm'
                      className = 'my-2 me-4 p-2 text-xs font-normal'
                      disabled  = {isSending}
                      onClick   = {(e: MouseEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCreateItem({});
                      }}>
                {isSending ? <Loader2 className='animate-spin' /> : createButtonLabel}
              </Button>

              { items && items.map((subItem) => {
                const isActive = pathname?.includes(String(subItem.href));
                return (
                  <SidebarMenuItem key={subItem.key}>
                    <div className='flex w-full items-center justify-between'>
                      <SidebarMenuButton className='truncate' isActive={isActive} asChild>
                        <Link href={UrlToString(roomRootPath.$url({_roomId:subItem.href ?? ''}))}>
                          {subItem.label ?? ''}
                        </Link>
                      </SidebarMenuButton>
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
                  </SidebarMenuItem>
                );
              })}
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
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
};
// SidebarContent △