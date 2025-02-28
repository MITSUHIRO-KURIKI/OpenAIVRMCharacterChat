'use client';

// react
import { useEffect, type Dispatch, type SetStateAction } from 'react';


// type
type ContentScaleOnMobileMenuOptions = {
  contentScale?:       number;
  contentScaleOffset?: number;
  wrapContentId?:      string;
};
type useContentScaleOnMobileMenuProps = {
  isMobileMenuOpen:      boolean;
  setIsTopNavBarVisible: Dispatch<SetStateAction<boolean>>;
  options?:              ContentScaleOnMobileMenuOptions;
};

// useContentScaleOnMobileMenu
// - モバイルメニューが開閉した際に #navbarWrapContent のスケールエフェクトを付与/除去するフック
export function useContentScaleOnMobileMenu({
  isMobileMenuOpen,
  setIsTopNavBarVisible,
  options: {
    contentScale       = 0.9,
    contentScaleOffset = 60,
    wrapContentId      = 'navbarWrapContent',
  } = {}, }: useContentScaleOnMobileMenuProps) {

  useEffect(() => {
    const wrapContent = document.getElementById(wrapContentId);
    if (!wrapContent) return;

    if (isMobileMenuOpen) {
      setIsTopNavBarVisible(false);
      wrapContent.style.setProperty('--contentScale', `${contentScale}`);
      wrapContent.style.setProperty(
        '--offsetYValue',
        `${window.scrollY * (1 - contentScale) - contentScaleOffset}px`,
      );
      wrapContent.classList.add(
        'scale-[var(--contentScale)]',
        'translate-y-[var(--offsetYValue)]',
      );
    } else {
      setIsTopNavBarVisible(true);
      wrapContent.classList.remove(
        'scale-[var(--contentScale)]',
        'translate-y-[var(--offsetYValue)]',
      );
    };
  }, [
    isMobileMenuOpen,
    setIsTopNavBarVisible,
    contentScale,
    contentScaleOffset,
    wrapContentId,
  ]);
};