/**
 * 以下のようにページのuseStateに合わせて発火させる.
 * 任意の場所に設置可能.
 * ex.
 *  const [isSending, setIsSending] = useState<boolean>(true);
 *  <OverlaySpinner isActivate={isSending} />
 */
'use client';

// react
import { useState, useEffect, type ReactElement } from 'react';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
// common
import { Loader } from '@/app/components/ui/common/Loader';


// OverlaySpinner
export function OverlaySpinner({ isActivate }: { isActivate: boolean }): ReactElement | null {
  const [shouldRender, setShouldRender] = useState<boolean>(isActivate);

  // フェードアウト終了後に要素を削除
  useEffect(() => {
    if (isActivate) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isActivate]);

  if (!shouldRender) return null;
  return (
    <div className={cn(
      'fixed inset-0 z-[9999] flex items-center justify-center',
      'bg-black bg-opacity-50 cursor-wait',
      'transition-opacity',
      'duration-300', "ease-[cubic-bezier(0.32,0.72,0,1)]",
      isActivate ? 'opacity-100' : 'opacity-0',)}>
      <Loader />
    </div>
  );
};