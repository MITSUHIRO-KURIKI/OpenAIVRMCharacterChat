// metadata
import { metadataConfig } from './metadata';
export const metadata = metadataConfig;
// react
import { Suspense, type ReactElement } from 'react';
// import
import Loading from '@/app/loading';
import { AuthRedirectForAuthenticated } from '@/app/wrappers';
// include
import { SignupContent } from './SignupContent';


// SignupPage ▽
export default async function SignupPage(): Promise<ReactElement> {
  return (
    <Suspense fallback={<Loading />}>
      <AuthRedirectForAuthenticated>
        <SignupContent />
      </AuthRedirectForAuthenticated>
    </Suspense>
  );
};
// SignupPage △