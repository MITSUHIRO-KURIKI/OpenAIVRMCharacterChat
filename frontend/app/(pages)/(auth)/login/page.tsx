// metadata
import { metadataConfig } from './metadata';
export const metadata = metadataConfig;
// react
import { Suspense, type ReactElement } from 'react';
// import
import Loading from '@/app/loading';
import { AuthRedirectForAuthenticated } from '@/app/wrappers';
// include
import { LoginContent } from './LoginContent';


// LoginPage ▽
export default async function LoginPage(): Promise<ReactElement> {
  return (
    <Suspense fallback={<Loading />}>
      <AuthRedirectForAuthenticated>
        <LoginContent />
      </AuthRedirectForAuthenticated>
    </Suspense>
  );
};
// LoginPage △