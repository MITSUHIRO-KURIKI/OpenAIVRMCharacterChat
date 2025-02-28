// metadata
import { metadataConfig } from './metadata';
export const metadata = metadataConfig;
// react
import { Suspense, type ReactElement } from 'react';
// import
import Loading from '@/app/loading';
import { AuthRedirectForAuthenticated } from '@/app/wrappers';
// include
import { PasswordResetContent } from './PasswordResetContent';


// PasswordResetPage ▽
export default async function PasswordResetPage(): Promise<ReactElement> {
  return (
    <Suspense fallback={<Loading />}>
      <AuthRedirectForAuthenticated>
        <PasswordResetContent />
      </AuthRedirectForAuthenticated>
    </Suspense>
  );
};
// PasswordResetPage △