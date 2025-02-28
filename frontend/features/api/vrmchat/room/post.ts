'use server';

// next-auth
import { type Session } from 'next-auth';
// lib
import axios from 'axios';
// paths
import { vrmChatPath } from '@/features/paths/backend';
// features
import { getAuthSession } from '@/features/nextauth';
import { BackendApiClient } from '@/features/apiClients';
// type
import type { DefaultResponse } from '@/features/api';

// type
type CreateRoomResponseData = {
  roomId: string;
};
type CreateRoomResponse = DefaultResponse & {
  data?: {
    roomId: string;
  };
};

// createRoom
export async function createRoom(): Promise<CreateRoomResponse> {

  const responseDefaultErrMsg = 'Failed to get data';

  try {
    const session: Session | null = await getAuthSession();
    const res = await BackendApiClient.post(
      vrmChatPath.room,
      null,
      { headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${session?.user?.accessToken}`,
      }}
    );
    //  Axios は 2xx 以外で catch に飛ぶ
    const data:CreateRoomResponseData = res.data;
    const response: CreateRoomResponse = {
      ok:     true,
      status: res.status,
      data: {
        roomId: data.roomId,
      },
    };
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {

      const status  = error.response.status;
      const errData = error.response.data;

      if (status === 429) {
        const response: CreateRoomResponse = {
          ok:           false,
          status:       429,
          message:      'Please try again later',
          toastType:    'error',
          toastMessage: 'Please try again later',
        };
        return response;
      } else if (errData && Array.isArray(errData.errors) && errData.errors.length > 0) {
        const detailStr = errData.errors[0].detail ?? responseDefaultErrMsg;
        const response: CreateRoomResponse = {
          ok:           false,
          status:       400, // 400しか返さない
          message:      String(detailStr),
          toastType:    'error',
          toastMessage: responseDefaultErrMsg,
        };
        return response;
      };
      const response: CreateRoomResponse = {
        ok:           false,
        status:       400, // 400しか返さない
        message:      responseDefaultErrMsg,
        toastType:    'error',
        toastMessage: responseDefaultErrMsg,
      };
      return response;
    };
    // error.response が無い場合 (ネットワーク障害など)
    const response: CreateRoomResponse = {
      ok:           false,
      status:       500,
      message:      responseDefaultErrMsg,
      toastType:    'error',
      toastMessage: responseDefaultErrMsg,
    };
    return response;
  };
};