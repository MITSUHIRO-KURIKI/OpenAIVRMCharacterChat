'use client';

// react
import {
  createContext,
  useState,
  type ReactNode,
  type ReactElement,
  type Dispatch,
  type SetStateAction,
} from 'react';
// type
import type { LoadItemDataProps } from '@/app/components/ui/Navigation';


// type
type SidebarContextProviderProps = {
  pageSize:  number,
  children:  ReactNode;
} & LoadItemDataProps;
export type SidebarContextValue = {
  pageSize:                   number,
  sidebarInsetTitle:          string;
  setSidebarInsetTitle:       Dispatch<SetStateAction<string>>;
  sidebarInsetSubTitle:       string;
  setSidebarInsetSubTitle:    Dispatch<SetStateAction<string>>;
  sidebarInsetSubTitleUrl:    string;
  setSidebarInsetSubTitleUrl: Dispatch<SetStateAction<string>>;
} & LoadItemDataProps;

// SidebarContextProvider ▽
export function SidebarContextProvider({
  pageSize,
  vrmChatItems,
  children, }: SidebarContextProviderProps): ReactElement {

  // sidebarInsetTitle, sidebarInsetSubTitle
  const [sidebarInsetTitle, setSidebarInsetTitle]             = useState<string>('');
  const [sidebarInsetSubTitle, setSidebarInsetSubTitle]       = useState<string>('');
  const [sidebarInsetSubTitleUrl, setSidebarInsetSubTitleUrl] = useState<string>('');

  const contextValue: SidebarContextValue = {
    pageSize,
    vrmChatItems,
    sidebarInsetTitle,
    setSidebarInsetTitle,
    sidebarInsetSubTitle,
    setSidebarInsetSubTitle,
    sidebarInsetSubTitleUrl,
    setSidebarInsetSubTitleUrl,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      { children }
    </SidebarContext.Provider>
  )
};
// SidebarContextProvider

// SidebarContext
export const SidebarContext = createContext<SidebarContextValue | null>(null);