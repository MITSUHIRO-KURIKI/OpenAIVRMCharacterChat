// react
import type { Dispatch, SetStateAction } from 'react';
// icons
import type { LucideIcon } from 'lucide-react';
// features
import type { pagesPath } from '@/features/paths/frontend';
// components
import type { SubItem } from '@/app/components/ui/Navigation/data';


export type MenuContentProps = {
  title:                   string;
  titleIcon?:              LucideIcon;
  createButtonLabel:       string;
  roomRootPath:            typeof pagesPath.servicesPath.vrmChatRoom;
  isSending:               boolean;
  items:                   SubItem[];
  handleLoadMoreItems:     () => Promise<void>;
  handleCreateItem:        ({setIsMobileMenuOpen}: {setIsMobileMenuOpen?: Dispatch<SetStateAction<boolean>>;}) => Promise<void>;
  handleItemNameEditModal: ({roomId, currentName}: {roomId: string, currentName: string}) => void;
  handleDeleteItemModal:   ({roomId}: {roomId: string}) => void;
  setIsMobileMenuOpen?:    Dispatch<SetStateAction<boolean>>;
};