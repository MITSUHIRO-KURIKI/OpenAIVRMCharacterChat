// metadata
import { metadataConfig } from './metadata';
export const metadata = metadataConfig;
// react
import { Suspense, type ReactElement} from 'react';
// import
import Loading from '@/app/loading';
// include
import { PasswordResetConfilmContent } from './PasswordResetConfilmContent';

// https://github.com/vercel/next.js/discussions/71997#discussioncomment-11531389
export type PasswordResetConfilmParams = {
  uid:   string,
  token: string,
}
type PageProps = {
	params: Promise<PasswordResetConfilmParams>;
};

// PasswordResetConfilmPage ▽
// ログインしていても表示許可
export default async function PasswordResetConfilmPage(props: PageProps): Promise<ReactElement>{
  
	const { uid, token } = await props.params;

	return (
    <Suspense fallback={<Loading />}>
      <PasswordResetConfilmContent uid={uid} token={token} />
    </Suspense>
  );
};
// PasswordResetConfilmPage △