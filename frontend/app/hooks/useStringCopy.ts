'use client';

// react
import { useCallback } from 'react';
// components
import { showToast } from '@/app/components/utils';

export function useStringCopy() {
  const handleStringCopy = useCallback((string: string) => {
    if (!string) return;
  
    if (typeof string === 'string') {
      navigator.clipboard.writeText(string).then(() => {
        showToast('success', 'copied');
      });
    }
  }, []);
  return handleStringCopy;
};