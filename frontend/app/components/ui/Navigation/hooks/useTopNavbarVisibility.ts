'use client';

// react
import { useState, useEffect, useRef } from 'react';


// useTopNavbarVisibility
// - スクロール方向に応じて Navbar の表示非表示を管理するカスタムフック
export function useTopNavbarVisibility() {

  const [isTopNavBarVisible, setIsTopNavBarVisible] = useState<boolean>(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollYRef.current) {
        setIsTopNavBarVisible(false);
      } else {
        setIsTopNavBarVisible(true);
      };
      lastScrollYRef.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    isTopNavBarVisible,
    setIsTopNavBarVisible,
  };
};