'use client';

// next
import { useRouter, usePathname } from 'next/navigation';
// react
import {
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
} from 'react';
// pagesPath
import { pagesPath } from '@/features/paths/frontend';
// features
import { UrlToString } from '@/features/utils';
import {
  createRoom                      as vrmChatCreateRoom,
  getRoomSettingsRoomNameList     as getVrmChatRoomSettingsRoomNameList,
  patchRoomSettingsRoomNameChange as patchVrmChatRoomSettingsRoomNameChange,
  deleteRoom                      as vrmChatDeleteRoom,
} from '@/features/api/vrmchat';
// hooks
import { useCommonSubmit } from '@/app/hooks';
// type
import type { ItemBase } from '../data';


// type
type UseChatRoomsProps = {
  pageSize?:            number;
  initialVrmChatItems?: ItemBase[] | [];
  setSidebarTitle?:     Dispatch<SetStateAction<string>>;
};

// useChatRooms ▽
export function useChatRooms({
  pageSize = 3,
  initialVrmChatItems,
  setSidebarTitle, }: UseChatRoomsProps) {

  // 状態管理系
  const router   = useRouter();
  const pathname = usePathname();
  const [isSending, setIsSending] = useState<boolean>(false);

  // ページネーション用
  const [vrmChatPage, setVrmChatPage]   = useState<number>(1);
  const [vrmChatItems, setVrmChatItems] = useState<ItemBase[]>(initialVrmChatItems ?? []);

  // EditRoomName
  const [editRoomName, setEditRoomName]                                 = useState<string>('');
  const [editRoomNametargetRoomId, setEditRoomNameTargetRoomId]         = useState<string>('');
  const [vrmChatEditRoomNameModalOpen, setVrmChatEditRoomNameModalOpen] = useState<boolean>(false);

  // DeleteRoom
  const [deleteRoomTargetRoomId, setDeleteRoomTargetRoomId]         = useState<string>('');
  const [vrmChatDeleteRoomModalOpen, setVrmChatDeleteRoomModalOpen] = useState<boolean>(false);

  // VrmChatRoom coleback ▽
  // - VrmChatRoom (EditModal)
  const handleOpenVrmChatEditRoomModal = useCallback(({roomId, currentName}: {roomId: string, currentName: string}) => {
    setEditRoomName(currentName);
    setEditRoomNameTargetRoomId(roomId);
    setVrmChatEditRoomNameModalOpen(true);
  }, []);
  // - VrmChatRoom (DeleteModal)
  const handleOpenVrmChatDeleteRoomModal = useCallback(({roomId}: {roomId: string}) => {
    setDeleteRoomTargetRoomId(roomId);
    setVrmChatDeleteRoomModalOpen(true);
  }, []);

  // - VrmChatRoom (Create)
  const handleCreateVrmChatRoom = useCommonSubmit<{setIsMobileMenuOpen?: Dispatch<SetStateAction<boolean>>}>({
    isSending,
    setIsSending,
    submitFunction: async () => {
      return await vrmChatCreateRoom();
    },
    onSuccess: (result, {setIsMobileMenuOpen}) => {
      const roomId = (result.data as { roomId: string }).roomId;
      // メニューに追加
      const newItem: ItemBase = {
        key:   roomId,
        label: 'NewVRMChatRoom',
        href:  roomId,
      };
      setVrmChatItems(prev => [newItem, ...prev]);
      // 新しい部屋にリダイレクト
      if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
      router.push(UrlToString(pagesPath.servicesPath.vrmChatRoom.$url({_roomId: roomId})));
    },
    defaultExceptionToastMessage: 'Failed to create new',
    defaultErrorMessage:          'Failed to create new',
  });

  // - VrmChatRoom (MoreLoad)
  const handleLoadMoreVrmChatRoom = useCommonSubmit<void>({
    isSending,
    setIsSending,
    submitFunction: async () => {
      const nextPage = vrmChatPage + 1;
      return await getVrmChatRoomSettingsRoomNameList({
        page: nextPage,
        size: pageSize,
      });
    },
    onSuccess: (result) => {
      setVrmChatItems([...(result.data as ItemBase[])]);
      setVrmChatPage((prev) => prev + 1);
    },
    defaultExceptionToastMessage: 'Loading error',
    defaultErrorMessage:          'Loading error',
  });

  // - VrmChatRoom (RoomNameChange)
  const handleSubmitVrmChatRoomNameChange = useCommonSubmit<{roomId: string, newRoomName: string}>({
    isSending,
    setIsSending,
    // setErrorMsg,
    submitFunction: async ({roomId, newRoomName}) => {
      return await patchVrmChatRoomSettingsRoomNameChange({
        roomId,
        formData: {
          room_name: newRoomName,
        },
      });
    },
    onSuccess: async (_result, { roomId, newRoomName }) => {
      // モーダルを閉じる
      setVrmChatEditRoomNameModalOpen(false);
      // メニューの更新
      setVrmChatItems(prev => 
        prev.map(item => item.key === roomId ? { ...item, label: newRoomName } : item )
      );
      // roomId が現在のパスに含まれていたらサイドバーのタイトルも変更する
      const currentRoomId = pathname.split('/').pop();
      if (setSidebarTitle && currentRoomId === roomId) {
        setSidebarTitle(newRoomName);
      };
    },
    defaultExceptionToastMessage: 'Update failed',
    defaultErrorMessage:          'Update failed',
  });

  // - VrmChatRoom (Delete)
  const handleSubmitVrmChatRoomDelete = useCommonSubmit<{roomId: string}>({
    isSending,
    setIsSending,
    // setErrorMsg,
    submitFunction: async ({roomId}) => {
      return await vrmChatDeleteRoom({roomId: roomId});
    },
    onSuccess: async (_result, { roomId }) => {
      // メニューから削除
      setVrmChatItems(prev => prev.filter(item => item.key !== roomId));
      // モーダルを閉じる
      setVrmChatDeleteRoomModalOpen(false);
      // roomId が現在のパスに含まれていたらリダイレクト
      const currentRoomId = pathname.split('/').pop();
      if (currentRoomId === roomId) {
        router.push(UrlToString(pagesPath.servicesPath.vrmChat.$url()));
      };
    },
    defaultExceptionToastMessage: 'Deletion failed',
    defaultErrorMessage:          'Deletion failed',
  });
  // VrmChatRoom coleback △

  return {
    // --- 汎用状態 ---
    isSending, setIsSending,
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
    setEditRoomNameTargetRoomId,
    deleteRoomTargetRoomId,
    setDeleteRoomTargetRoomId,
  };
};
// useChatRooms △