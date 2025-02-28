/**
 * リダイレクト時メッセージ表示のカスタムフック
 */
'use client';

// next
import { useSearchParams } from 'next/navigation';
// react
import { useEffect } from 'react';
// features
import { logout } from '@/features/api/token';
// components
import { showToast } from '@/app/components/utils';

export function useRedirectErrorMessage(): void {
  const searchParams = useSearchParams();
  const error        = searchParams.get('errmsg');
  useEffect(() => {
    if (error === 'unauthenticated') {
      showToast('info', 'ログインが必要です');
      logout();
    };
    if (error === 'notfound') {
      showToast('info', 'ページが見つかりませんでした');
    };
    if (error === 'dataerr') {
      showToast('error', 'データが取得できませんでした');
    };
    // 必要に応じてエラーの種類を増やす
  }, [error]);
};