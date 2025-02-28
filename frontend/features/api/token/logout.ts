// next-auth
import { signOut } from 'next-auth/react';
// features
import { FrontendWithCredentialsApiClient } from '@/features/apiClients';
// components
import { showToast } from '@/app/components/utils';
// paths
import { apiPath } from '@/features/paths/frontend';


// logout
export async function logout(): Promise<void> {
  try {
    // front API を叩いて リフレッシュトークンを無効化
    await FrontendWithCredentialsApiClient.post(apiPath.authPath.logout);
    showToast('info', 'logout');
    setTimeout(() => {
      // Next Auth のログアウト
      void signOut({
        callbackUrl: '/',
      });
    }, 1500);
  } catch {
    showToast('error', 'error');
  };
};