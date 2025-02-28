'use client';

import { useState, MouseEvent } from 'react';
import type { MenuContent } from '../type.d';

export function useMobileMenu() {

  const [isMobileMenuOpen, setIsMobileMenuOpen]     = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen]           = useState(false);
  const [subMenuName, setSubMenuName]               = useState<MenuContent>(null); // null = 大項目一覧表示,
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [overlayActive, setOverlayActive]           = useState(false);

  // サブメニューへ遷移
  const handleMenuClick = (e: MouseEvent<HTMLElement>, menuName: MenuContent) => {
    e.preventDefault();
    e.stopPropagation();
    setSubMenuName(menuName);
    setIsSubMenuOpen(true);
  };

  // サブメニューを閉じてメインメニューに戻る
  const handleGoBack = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSubMenuOpen(false);
  };

  // アカウント設定モーダル
  const handleOpenAccountModal = () => {
    // メニューを閉じてからモーダルを開く
    setIsMobileMenuOpen(false);
    setIsAccountModalOpen(true);
  };

  return {
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isSubMenuOpen,
    setIsSubMenuOpen,
    subMenuName,
    setSubMenuName,
    isAccountModalOpen,
    setIsAccountModalOpen,
    overlayActive,
    setOverlayActive,
    handleMenuClick,
    handleGoBack,
    handleOpenAccountModal,
  };
};