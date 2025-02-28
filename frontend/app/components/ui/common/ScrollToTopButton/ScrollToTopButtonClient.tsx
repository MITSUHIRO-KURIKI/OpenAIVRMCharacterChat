'use client';

// react
import { type ReactElement, useEffect, useState } from 'react';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import { Button } from '@/app/components/ui/shadcn/button';
// icons
import { SquareChevronUp } from 'lucide-react';

// ScrollToTopButtonClient ▽
export function ScrollToTopButtonClient(): ReactElement {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = (): void => {
      if (window.scrollY > 50) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      };
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = (): void => {
    try {
      window.scrollTo({
        top:      0,
        behavior: 'smooth',
      });
    } catch {};
  };

  return (
    <Button variant   = 'ghost'
            size      = 'sm'
            onClick   = {scrollToTop}
            className = {cn(
              'fixed bottom-4 right-3 z-backToTop bg-transparent text-muted transition-all duration-700',
              'hover:text-foreground hover:bg-transparent',
              isVisible ? 'opacity-100': 'opacity-0 pointer-events-none',)}
            aria-label='Scroll to top'>
      <SquareChevronUp />
    </Button>
  );
};
// ScrollToTopButtonClient △