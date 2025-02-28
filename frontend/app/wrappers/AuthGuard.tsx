/**
 * 未ログイン/リフレッシュトークンが無効
 * -> 強制ログアウト
 * -> ログイン後に元ページへリダイレクト
 */

'use client';

// next-auth
import { useSession, signOut } from 'next-auth/react';
// next
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
// react
import { useEffect, type ReactNode, type ReactElement} from 'react';
// paths
import { pagesPath } from '@/features/paths/frontend';
// features
import { UrlToString, sanitizeRedirectUrl } from '@/features/utils';
// components
import { showToast } from '@/app/components/utils';
// import
import Loading from '@/app/loading';


// AuthGuard
export function AuthGuard({ children }: {children: ReactNode}): ReactElement {

  const { data: session, status } = useSession();

  const pathname       = usePathname();
  const searchParams   = useSearchParams();
  const searchString   = searchParams.toString();
  const fullPath       = searchString ? `${pathname}?${searchString}` : pathname;
  const safeFullPath   = sanitizeRedirectUrl(fullPath) || pagesPath.$url();
  const router         = useRouter();
  const callbackUrlObj = pagesPath.authPath.login.$url({query: { next: safeFullPath }});

  // 未ログインならリダイレクト
  useEffect(() => {
    if (status === 'loading') return; // ロード/リダイレクト中なら何もしない

    if (session?.error === 'TokenError') {
      showToast('info', 'ログインしてください');
      setTimeout(() => {
        void signOut({
          callbackUrl: UrlToString(callbackUrlObj),
        });
      }, 1500);
    };

    if (!session) {
      showToast('info', 'ログインしてください');
      router.push(UrlToString(callbackUrlObj));
    };

  }, [session, status, router, callbackUrlObj]);

  if (status === 'loading') {
    return <Loading />;
  };

  return <>{children}</>;
};