// metadata
import { metadataConfig } from './metadata';
export const metadata = metadataConfig;
// react
import { Suspense, type ReactElement } from 'react';
// import
import Loading from '@/app/loading';
// include
import { VrmChatContent } from './VrmChatContent';


// VrmChatPage ▽
export default async function VrmChatPage(): Promise<ReactElement> {
  return (
    <Suspense fallback={<Loading />}>
      <VrmChatContent />
    </Suspense>
  );
};
// VrmChatPage △