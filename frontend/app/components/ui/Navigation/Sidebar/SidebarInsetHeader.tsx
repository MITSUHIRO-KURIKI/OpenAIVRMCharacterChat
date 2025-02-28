'use client';

// react
import type { ReactElement } from 'react';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import { SidebarTrigger } from '@/app/components/ui/shadcn/sidebar';
import { Separator } from '@/app/components/ui/shadcn/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/app/components/ui/shadcn/breadcrumb';


// type
export type SidebarInsetHeaderProps = {
  sidebarInsetTitle:       string | undefined;
  sidebarInsetSubTitle:    string | undefined;
  sidebarInsetSubTitleUrl: string | undefined;
};

// SidebarInsetHeader ▽
export function SidebarInsetHeader({
  sidebarInsetTitle,
  sidebarInsetSubTitle,
  sidebarInsetSubTitleUrl, }: SidebarInsetHeaderProps): ReactElement {

  return (
    <header className={cn(
              'sticky top-0 h-12 z-sticky',
              'flex shrink-0 items-center',
              'bg-background/30 dark:bg-background/30',
              'backdrop-blur-sm backdrop-filter',
              'gap-2 border-b',)}>
      <div className='flex items-center gap-2 pl-2 pr-4'>
        <SidebarTrigger className='-ml-1 hidden justify-center md:flex' />
        <Separator orientation='vertical' className='mr-2 hidden h-4 md:block' />
        <Breadcrumb>
          <BreadcrumbList>
            { sidebarInsetSubTitle &&
              <>
                <BreadcrumbItem className='hidden md:block'>
                  <BreadcrumbLink href={sidebarInsetSubTitleUrl ?? '#'}>
                    {sidebarInsetSubTitle}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className='hidden md:block' />
              </>
            }
            { sidebarInsetTitle &&
              <BreadcrumbItem>
                <BreadcrumbPage>{sidebarInsetTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            }
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
};
// SidebarInsetHeader △