'use server';

// next
import { redirect } from 'next/navigation';
// react
import { Suspense, type ReactElement } from 'react';
// pagesPath
import { pagesPath } from '@/features/paths/frontend';
// features
import { getRoomSettingsRoomName } from '@/features/api/vrmchat';
import { UrlToString } from '@/features/utils';
// include
import { VrmChatRoomContent } from './VrmChatRoomContent';
// import
import Loading from '@/app/loading';


// https://github.com/vercel/next.js/discussions/71997#discussioncomment-11531389
export type VrmChatRoomParams = {
    roomId:    string,
    roomTitle: string,
}
type PageProps = {
    params: Promise<VrmChatRoomParams>;
};

// VrmChatRoomPage
export default async function VrmChatRoomPage(props: PageProps): Promise<ReactElement>{

  const { roomId } = await props.params;
  
  // ルームタイトル取得および認証 (権限や未知のroomIdならここで弾く)
  const [result] = await Promise.all([
    getRoomSettingsRoomName({roomId: roomId}),
  ]);
  // ルームへのアクセス権限がない場合やroomIdが見つからない場合には 404
  if (!result?.ok) {
    redirect(UrlToString(pagesPath.servicesPath.vrmChat.$url({query:{errmsg: 'notfound'}})));
  };
  const roomTitle = result.data ?? '';

  return (
    <Suspense fallback={<Loading />}>
      <VrmChatRoomContent roomId    = {roomId}
                          roomTitle = {roomTitle} />
    </Suspense>
  );
};