'use client';

// react
import {
  useContext,
  ComponentProps,
  type ReactElement,
} from 'react';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarFooter,
  SidebarInset,
  SidebarProvider,
} from '@/app/components/ui/shadcn/sidebar';
import { Separator } from '@/app/components/ui/shadcn/separator';
// icons
import {
  AudioLines,
} from 'lucide-react';
// pagesPath
import { pagesPath } from '@/features/paths/frontend';
// providers
import { SidebarContext } from '../providers';
// hooks
import { useChatRooms } from '../hooks';
// features
import {
  roomSettingsRoomNameChangeSchema as vrmChatRoomSettingsRoomNameChangeSchema,
} from '@/features/api/vrmchat';
// components
import { showToast } from '@/app/components/utils';
// include
import { SidebarContent as Content } from './SidebarContent';
import { RoomNameChangeDialog, DeleteCheckDialog } from '../utils';
import { Author } from './Author';
import { SidebarInsetHeader } from './SidebarInsetHeader';


// LeftSidebar ▽
export function LeftSidebar({ children, ...props }: ComponentProps<typeof Sidebar>): ReactElement {
  // sidebarContext first ▽
  const sidebarContext = useContext(SidebarContext);
  const {
    pageSize,
    vrmChatItems: initialVrmChatItems,
    sidebarInsetTitle,
    setSidebarInsetTitle,
    sidebarInsetSubTitle,
    sidebarInsetSubTitleUrl,
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

  // sidebarContext last ▽
  if (!sidebarContext) {
    showToast('error', 'error', { position: 'bottom-right', duration: 3000 });
    return <p className='select-none text-xs font-thin text-muted-foreground'>Sorry, not available</p>;
  };
  // sidebarContext last △

  return (
    <SidebarProvider className='min-h-[calc(100svh_-_var(--navbar-height))]'>
      <Sidebar {...props} >
        <SidebarHeader></SidebarHeader>
        <SidebarContent className='gap-0'>

          {/* VRM Chat */}
          <Content
            title                   = {'VRM Chat'}
            titleIcon               = {AudioLines}
            createButtonLabel       = {'new conversation'}
            roomRootPath            = {pagesPath.servicesPath.vrmChatRoom}
            isSending               = {isSending}
            items                   = {vrmChatItems}
            handleLoadMoreItems     = {handleLoadMoreVrmChatRoom}
            handleCreateItem        = {handleCreateVrmChatRoom}
            handleItemNameEditModal = {({roomId, currentName})=>{
              handleOpenVrmChatEditRoomModal({roomId, currentName});
            }}
            handleDeleteItemModal    = {({roomId})=>{
              handleOpenVrmChatDeleteRoomModal({roomId});
            }} />

        </SidebarContent>

        {/* Footer */}
        <Separator className='mt-4' />
        <SidebarFooter>
          <Author />
        </SidebarFooter>
        <SidebarRail className='hover:after:bg-transparent' />

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

      </Sidebar>

      <SidebarInset className={cn(
                    'w-full overflow-auto',
                    'max-h-[calc(100svh_-_var(--navbar-height))] min-h-[calc(100svh_-_var(--navbar-height))]',
                    'peer-data-[variant=inset]:min-h-[calc(100svh_-_var(--navbar-height))]',
                    'md:peer-data-[variant=inset]:rounded-l-xl md:peer-data-[variant=inset]:rounded-r-none',
                    'md:peer-data-[variant=inset]:m-0',)}>
        <SidebarInsetHeader sidebarInsetTitle       = {sidebarInsetTitle}
                            sidebarInsetSubTitle    = {sidebarInsetSubTitle}
                            sidebarInsetSubTitleUrl = {sidebarInsetSubTitleUrl}/>
        <div className={cn(
          'relative x-full h-full',
          'whitespace-normal break-all',
          'px-4 pt-3 pb-8',)}>
            { children }
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
};
// LeftSidebar △