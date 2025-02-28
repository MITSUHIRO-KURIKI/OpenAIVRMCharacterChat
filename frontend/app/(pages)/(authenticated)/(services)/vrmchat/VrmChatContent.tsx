'use client';

// react
import { useEffect, useContext, type ReactElement } from 'react';
// pagesPath
import { pagesPath } from '@/features/paths/frontend';
// providers
import {
  SidebarContext,
  type SidebarContextValue,
} from '@/app/components/ui/Navigation';
// hooks
import { useRedirectErrorMessage } from '@/app/hooks/';
// features
import { UrlToString } from '@/features/utils';
// components
import { showToast } from '@/app/components/utils';


// VrmChatContent
export function VrmChatContent(): ReactElement {

  // Sidebar タイトルセット ▽
  const sbarContext = useContext(SidebarContext);
  const {
    setSidebarInsetTitle,
    setSidebarInsetSubTitle,
    setSidebarInsetSubTitleUrl,
  } = sbarContext as SidebarContextValue || {};
  useEffect(() => {
    if (setSidebarInsetTitle)       setSidebarInsetTitle('Home');
    if (setSidebarInsetSubTitle)    setSidebarInsetSubTitle('');
    if (setSidebarInsetSubTitleUrl) setSidebarInsetSubTitleUrl(UrlToString(pagesPath.servicesPath.vrmChat.$url()));
  }, [setSidebarInsetTitle, setSidebarInsetSubTitle, setSidebarInsetSubTitleUrl]);
  // Sidebar タイトルセット △

  // リダイレクト時メッセージ処理
  useRedirectErrorMessage();

  // SidebarContext last ▽
  if (!sbarContext ) {
    showToast('error', 'error', { position: 'bottom-right', duration: 3000 });
    return <p className='select-none text-xs font-thin text-muted-foreground'>Sorry, not available</p>;
  };
  // SidebarContext last △
  return (
    <>
    <p>
      You can create a new conversation from the left sidebar
    </p>
    </>
  )
};