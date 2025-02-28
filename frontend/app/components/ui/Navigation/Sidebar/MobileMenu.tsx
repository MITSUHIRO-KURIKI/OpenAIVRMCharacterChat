// https://github.com/shadcn-ui/ui/discussions/1790#discussioncomment-7348150
'use client';

// next
import Link from 'next/link';
// react
import {
  useContext,
  type ReactElement,
  type Dispatch,
  type SetStateAction,
  type MouseEvent,
} from 'react';
// pagesPath
import { pagesPath } from '@/features/paths/frontend';
// shadcn/ui
import { cn } from '@/app/components/lib/shadcn';
import { Button } from '@/app/components/ui/shadcn/button';
// icons
import {
  Menu,
  ChevronRight,
  ChevronLeft,
  AudioLines,
} from 'lucide-react';
// providers
import { SidebarContext } from '../providers';
// features
import {
  roomSettingsRoomNameChangeSchema as vrmChatRoomSettingsRoomNameChangeSchema,
} from '@/features/api/vrmchat';
// hooks
import { useChatRooms } from '../hooks';
import { useMobileMenu } from '../hooks';
// components
import { ThemeToggle, Loader } from '@/app/components/ui/common';
import { showToast } from '@/app/components/utils';
// include
import { MobileMenuBase } from '../MobileMenuBase';
import { AccountSettingsModal } from '../AccountSettingsModal';
import { RoomNameChangeDialog, DeleteCheckDialog } from '../utils';
import { AccountMenuItems } from '../data';
import { MobileSubMenu } from './MobileSubMenu';


// type
type MobileMenuProps = {
  setIsTopNavBarVisible: Dispatch<SetStateAction<boolean>>;
};

// MobileMenu ▽
export function MobileMenu({setIsTopNavBarVisible,}: MobileMenuProps): ReactElement {

  // sidebarContext first ▽
  const sidebarContext = useContext(SidebarContext);
  const {
    pageSize,
    vrmChatItems: initialVrmChatItems,
    setSidebarInsetTitle,
  } = sidebarContext || {};
  // sidebarContext first △

  // useChatRooms
  const {
    // --- 汎用状態 ---
    isSending,
    // --- VRM Chat ---
    vrmChatItems,
    vrmChatEditRoomNameModalOpen,
    setVrmChatEditRoomNameModalOpen,
    vrmChatDeleteRoomModalOpen,
    setVrmChatDeleteRoomModalOpen,
    handleCreateVrmChatRoom,
    handleLoadMoreVrmChatRoom,
    handleOpenVrmChatDeleteRoomModal,
    handleOpenVrmChatEditRoomModal,
    handleSubmitVrmChatRoomNameChange,
    handleSubmitVrmChatRoomDelete,
    // --- ルーム名編集/削除 ダイアログで使う共通状態 ---
    editRoomName,
    setEditRoomName,
    editRoomNametargetRoomId,
    deleteRoomTargetRoomId,
  } = useChatRooms({
    pageSize,
    initialVrmChatItems: initialVrmChatItems,
    setSidebarTitle:     setSidebarInsetTitle,
  });

  // useMobileMenu
  const {
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isSubMenuOpen,
    subMenuName,
    isAccountModalOpen,
    setIsAccountModalOpen,
    overlayActive,
    setOverlayActive,
    handleMenuClick,
    handleGoBack,
    handleOpenAccountModal,
  } = useMobileMenu();

  // accountMenu (ログイン中かで切り替え)
  const accountMenuItems = AccountMenuItems();

  // sidebarContext last ▽
  if (!sidebarContext) {
    showToast('error', 'error', { position: 'bottom-right', duration: 3000 });
    return <p className='select-none text-xs font-thin text-muted-foreground'>Sorry, not available</p>;
  };
  // sidebarContext last △

  return (
    <>
      <Button variant   = 'ghost'
              size      = 'icon'
              className = 'md:hidden [&_svg]:size-6'
              onClick   = {() => setIsMobileMenuOpen(true)}>
        <Menu />
        <span className='sr-only'>Toggle menu</span>
      </Button>

      <MobileMenuBase isMobileMenuOpen      = {isMobileMenuOpen}
                      setIsMobileMenuOpen   = {setIsMobileMenuOpen}
                      overlayActive         = {overlayActive}
                      setIsTopNavBarVisible = {setIsTopNavBarVisible}>

        {/* メインカテゴリ画面 */}
        <div className={cn(
          'absolute top-0 left-0 size-full transition-transform',
          'duration-500', "ease-[cubic-bezier(0.32,0.72,0,1)]",
          !isSubMenuOpen ? 'translate-x-0' : '-translate-x-full',)}>
          <div>
            <ul className='w-full space-y-2 pr-8'>

              {/* VRM Chat */}
              <Button variant   = 'link'
                      size      = 'fit'
                      className = {cn(
                        'w-full h-8 justify-start rounded',
                        'text-sm font-normal text-foreground',
                        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',)}
                      onClick = {(e: MouseEvent<HTMLElement>) => handleMenuClick(e, 'vrmChat')}>
                  <AudioLines />VRM Chat
                  <ChevronRight className='text-foreground' />
              </Button>
            </ul>

            <div className={cn(
              'mt-6 mb-2 mr-8 ml-0',
              'h-[1px] w-auto rounded-full bg-border',)} />

            {/* accountMenuItems */}
            <div className='w-full space-y-2 pr-8'>
              {accountMenuItems.map((item, idx) => {
                if (item.type === 'loading') {
                  return <div key={`${item.key}-${idx}`}><Loader /></div>;
                } else if (item.type === 'divided') {
                  return <div key={`${item.key}-${idx}`} className={cn('my-2','h-[1px] w-full rounded-full bg-border',)} />;
                } else if (item.key === 'settings') {
                  return (
                    <Button variant   = 'link'
                            size      = 'fit'
                            key       = {item.key}
                            onClick   = {handleOpenAccountModal}
                            className = {cn(
                              'w-full h-8 justify-start rounded',
                              'text-sm font-normal text-foreground',
                              'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                              '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',)}>
                      {item.icon && <item.icon />}{item.label}
                    </Button>
                  );
                } else if (item.type === 'action' && item.onClick) {
                  return (
                    <Button variant   = 'link'
                            size      = 'fit'
                            key       = {item.key}
                            onClick   = {() => {
                              setOverlayActive(true);
                              item.onClick?.();
                            }}
                            className = {cn(
                              'w-full h-8 justify-start rounded',
                              'text-sm font-normal text-foreground',
                              'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                              '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',)}>
                      {item.icon && <item.icon />}{item.label}
                    </Button>
                  );
                };
                return (
                  <Link key       = {item.key}
                        href      = {item.href ?? '#'}
                        className = {cn(
                          'flex gap-2 w-full h-8 justify-start items-center rounded',
                          'text-sm font-normal text-foreground select-none',
                          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                          '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',)}
                        onClick={() => setIsMobileMenuOpen(false)} >
                    {item.icon && <item.icon className='size-4' />}{item.label}
                  </Link>
                );
              })}

              {/* ThemeToggle */}
              <div className = {cn(
                'relative flex justify-between cursor-default select-none items-center gap-2 ',
                'text-xs font-light text-foreground text-left',
                'outline-none',
              )}>
                <span>Appearance</span>
                <ThemeToggle />
              </div>

            </div>
          </div>
        </div>

        {/* サブカテゴリ画面 */}
        <div className={cn(
          'absolute top-0 left-0 size-full transition-transform',
          'duration-500', "ease-[cubic-bezier(0.32,0.72,0,1)]",
          isSubMenuOpen ? 'translate-x-0' : 'translate-x-full',)} >
            <Button variant   ='ghost'
                    size      = 'xs'
                    className = {cn(
                      'justify-start rounded',
                      'text-xs text-foreground/60',
                      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      '[&>svg]:text-foreground/60 hover:[&>svg]:text-sidebar-accent-foreground',)}
                    onClick = {(e: MouseEvent<HTMLElement>,) => handleGoBack(e)}>
              <ChevronLeft />
              <span>back</span>
            </Button>
            <div className='space-y-4 pt-4'>
              {/* サブカテゴリ ▽ */}
                {subMenuName === 'vrmChat'
                  && <MobileSubMenu
                        title                   = {'VRM Chat'}
                        createButtonLabel       = {'new conversation'}
                        roomRootPath            = {pagesPath.servicesPath.vrmChatRoom}
                        setIsMobileMenuOpen     = {setIsMobileMenuOpen}
                        isSending               = {isSending}
                        items                   = {vrmChatItems}
                        handleLoadMoreItems     = {handleLoadMoreVrmChatRoom}
                        handleCreateItem        = {handleCreateVrmChatRoom}
                        handleItemNameEditModal = {({roomId, currentName})=>{
                          handleOpenVrmChatEditRoomModal({roomId, currentName});
                        }}
                        handleDeleteItemModal    = {({roomId})=>{
                          handleOpenVrmChatDeleteRoomModal({roomId});
                        }} />}
                {!subMenuName
                  && <></>}
              {/* サブカテゴリ △ */}
          </div>
        </div>
      </MobileMenuBase>

      {/* アカウント設定 モーダル */}
      <AccountSettingsModal open         = {isAccountModalOpen}
                            onOpenChange = {setIsAccountModalOpen} />

      {/* RoomNameChangeDialog */}
      <RoomNameChangeDialog onSubmit                 = {handleSubmitVrmChatRoomNameChange}
                            isSending                = {isSending}
                            roomNameSchema           = {vrmChatRoomSettingsRoomNameChangeSchema}
                            editRoomName             = {editRoomName}
                            setEditRoomName          = {setEditRoomName}
                            editRoomNametargetRoomId = {editRoomNametargetRoomId}
                            modalOpen                = {vrmChatEditRoomNameModalOpen}
                            setModalOpen             = {setVrmChatEditRoomNameModalOpen} />
      {/* DeleteCheckDialog */}
      <DeleteCheckDialog onDelete               = {handleSubmitVrmChatRoomDelete}
                         isSending              = {isSending}
                         deleteRoomTargetRoomId = {deleteRoomTargetRoomId}
                         modalOpen              = {vrmChatDeleteRoomModalOpen}
                         setModalOpen           = {setVrmChatDeleteRoomModalOpen}/>
    </>
  );
};
// MobileMenu △