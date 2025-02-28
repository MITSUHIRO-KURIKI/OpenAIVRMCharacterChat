// metadata
import { metadataConfig } from './metadata';
export const metadata = metadataConfig;
// react
import { Suspense, type ReactElement} from 'react';
// features
import { type ActivationParams } from '@/features/api/accounts';
// import
import Loading from '@/app/loading';
// include
import { ActivateContent } from './ActivateContent';

// https://github.com/vercel/next.js/discussions/71997#discussioncomment-11531389
type PageProps = {
	params: Promise<ActivationParams>;
};

// ActivatePage ▽
// ログインしていても表示許可
export default async function ActivatePage(props: PageProps): Promise<ReactElement>{
  
	const { uid, token } = await props.params;

	return (
    <Suspense fallback={<Loading />}>
      <ActivateContent uid={uid} token={token} />
    </Suspense>
  );
};
// ActivatePage △