 // react
import { type ReactElement } from 'react';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
// features
import { getRoomSettingsRoomNameList as getVrmChatRoomSettingsRoomNameList } from '@/features/api/vrmchat';
// components
import { TopNavbar, Sidebar, SidebarContextProvider } from '@/app/components/ui/Navigation';
// import
import { NavigationWrapperProps } from './type.d';

// SidebarWrapper
export async function SidebarWrapper({ wrapName, className, children }: NavigationWrapperProps): Promise<ReactElement> {
  const isUseSidebar  = true;
  const navbarBgColor = 'bg-sidebar';
  const pageSize      = 3;

  // InitData (サーバ取得)
  const [vrmChatInitial] = await Promise.all([
    getVrmChatRoomSettingsRoomNameList({page: 1, size: pageSize}),
  ]);
  const vrmChatItems = vrmChatInitial?.data ?? [];

  return (
    <>
    <SidebarContextProvider pageSize     = {pageSize}
                            vrmChatItems = {vrmChatItems}>
      <TopNavbar isUseSidebar  = {isUseSidebar}
                 navbarBgColor = {navbarBgColor} />
      <div id={ wrapName ?? 'navbarWrapContent'}
           className={cn(
            'origin-top',
            'absolute top-[var(--navbar-height)] w-full h-[calc(100svh_-_var(--navbar-height))] min-h-[calc(100svh_-_var(--navbar-height))]',
            'transform transition-transform',
            'duration-300', "ease-[cubic-bezier(0.32,0.72,0,1)]",
            className,)}>
        <Sidebar variant     = 'inset'
                 collapsible = 'offcanvas'
                 className   = {cn(
                  'invisible-scrollbar',
                  'hidden md:flex',)}>
          {children}
        </Sidebar>
      </div>
    </SidebarContextProvider>
    </>
  );
};