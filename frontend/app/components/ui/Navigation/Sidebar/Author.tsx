'use client'

import Link from 'next/link';
// react
import { type ReactElement } from 'react';
// shadcn / ui
import { cn } from '@/app/components/lib/shadcn';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/app/components/ui/shadcn/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/shadcn/dropdown-menu';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/shadcn/avatar';
// icons
import { Github, Linkedin, ExternalLink, ChevronsUpDown } from 'lucide-react';


// Author
export function Author(): ReactElement {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>

          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size      = 'lg'
                               className = {cn(
                                'data-[state=open]:bg-sidebar-accent',
                                'data-[state=open]:text-sidebar-accent-foreground'
                               )} >
              <Avatar className='size-8 rounded-lg'>
                <AvatarImage src='/base/author.jpg' alt='K.Mitsuhiro' />
                <AvatarFallback className='rounded-lg bg-sky-400' />
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>K.Mitsuhiro</span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent className  = 'w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
                               side       = {isMobile ? 'bottom' : 'right'}
                               align      = 'end'
                               sideOffset = {4}>
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='size-8 rounded-lg'>
                  <AvatarImage src='/base/author.jpg' alt='K.Mitsuhiro' />
                  <AvatarFallback className='rounded-lg bg-sky-400' />
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='select-none truncate font-semibold'>K.Mitsuhiro</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href='https://github.com/MITSUHIRO-KURIKI' target='_blank' rel='noopener noreferrer'>
                  <span className='flex w-full items-center justify-between text-gray-500 hover:text-foreground'>
                    <span className='inline-flex items-center gap-2 text-foreground'>
                      <Github className='size-4' />github
                    </span>
                    <ExternalLink className='size-4 text-inherit' />
                  </span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href='https://www.linkedin.com/in/mitsuhiro-k/' target='_blank' rel='noopener noreferrer'>
                  <span className='flex w-full items-center justify-between text-gray-500 hover:text-foreground'>
                    <span className='inline-flex items-center gap-2 text-foreground'>
                      <Linkedin className='size-4' />linkedin
                    </span>
                    <ExternalLink className='size-4 text-inherit' />
                  </span> 
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>

        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
};
