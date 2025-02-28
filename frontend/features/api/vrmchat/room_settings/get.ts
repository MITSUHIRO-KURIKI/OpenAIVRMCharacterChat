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
import { parseResponseData } from '@/features/utils';
// type
import type { RoomSettingsResponseData, RoomSettingsRoomNameListResponseItem } from './type.d';
import type { ItemBase } from '@/app/components/ui/Navigation/data';
import type { DefaultResponse } from '@/features/api';

// type
type GetRoomSettingsResponse = DefaultResponse & {
  data?: RoomSettingsResponseData;
};
type GetRoomSettingsRoomNameResponse = DefaultResponse & {
  data?: string;
};
type GetRoomSettingsRoomNameListResponse = DefaultResponse & {
  data?: ItemBase[];
};

// getRoomSettings
export async function getRoomSettings({roomId}: {roomId: string}): Promise<GetRoomSettingsResponse> {

  const responseDefaultErrMsg = 'Failed to get data';

  try {
    const session: Session | null = await getAuthSession();
    const res = await BackendApiClient.get(
      vrmChatPath.room_settings+roomId,
      { headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${session?.user?.accessToken}`,
      }}
    );
    //  Axios は 2xx 以外で catch に飛ぶ
    const data:RoomSettingsResponseData = res.data;
    const response: GetRoomSettingsResponse = {
      ok:     true,
      status: res.status,
      data:   data,
    };
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {

      const status  = error.response.status;
      const errData = error.response.data;

      if (status === 429) {
        const response: GetRoomSettingsResponse = {
          ok:           false,
          status:       429,
          message:      'Please try again later',
          toastType:    'error',
          toastMessage: 'Please try again later',
        };
        return response;
      } else if (errData && Array.isArray(errData.errors) && errData.errors.length > 0) {
        const detailStr = errData.errors[0].detail ?? responseDefaultErrMsg;
        const response: GetRoomSettingsResponse = {
          ok:           false,
          status:       400, // 400しか返さない
          message:      String(detailStr),
          toastType:    'error',
          toastMessage: responseDefaultErrMsg,
        };
        return response;
      };
      const response: GetRoomSettingsResponse = {
        ok:           false,
        status:       400, // 400しか返さない
        message:      responseDefaultErrMsg,
        toastType:    'error',
        toastMessage: responseDefaultErrMsg,
      };
      return response;
    };
    // error.response が無い場合 (ネットワーク障害など)
    const response: GetRoomSettingsResponse = {
      ok:           false,
      status:       500,
      message:      responseDefaultErrMsg,
      toastType:    'error',
      toastMessage: responseDefaultErrMsg,
    };
    return response;
  };
};

// getRoomSettingsRoomName
export async function getRoomSettingsRoomName({roomId}: {roomId: string}): Promise<GetRoomSettingsRoomNameResponse> {

  const responseDefaultErrMsg = 'Failed to get data';

  try {
    const session: Session | null = await getAuthSession();
    const res = await BackendApiClient.get(
      vrmChatPath.room_settings+roomId,
      { headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${session?.user?.accessToken}`,
      }}
    );
    //  Axios は 2xx 以外で catch に飛ぶ
    const data:RoomSettingsRoomNameListResponseItem = res.data;
    const response: GetRoomSettingsRoomNameResponse = {
      ok:     true,
      status: res.status,
      data:   data.roomName,
    };
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {

      const status  = error.response.status;
      const errData = error.response.data;

      if (status === 429) {
        const response: GetRoomSettingsRoomNameResponse = {
          ok:           false,
          status:       429,
          message:      'Please try again later',
          toastType:    'error',
          toastMessage: 'Please try again later',
        };
        return response;
      } else if (errData && Array.isArray(errData.errors) && errData.errors.length > 0) {
        const detailStr = errData.errors[0].detail ?? responseDefaultErrMsg;
        const response: GetRoomSettingsRoomNameResponse = {
          ok:           false,
          status:       400, // 400しか返さない
          message:      String(detailStr),
          toastType:    'error',
          toastMessage: responseDefaultErrMsg,
        };
        return response;
      };
      const response: GetRoomSettingsRoomNameResponse = {
        ok:           false,
        status:       400, // 400しか返さない
        message:      responseDefaultErrMsg,
        toastType:    'error',
        toastMessage: responseDefaultErrMsg,
      };
      return response;
    };
    // error.response が無い場合 (ネットワーク障害など)
    const response: GetRoomSettingsRoomNameResponse = {
      ok:           false,
      status:       500,
      message:      responseDefaultErrMsg,
      toastType:    'error',
      toastMessage: responseDefaultErrMsg,
    };
    return response;
  };
};

// getRoomSettingsRoomNameList
export async function getRoomSettingsRoomNameList({page, size}: {page: number, size:number}): Promise<GetRoomSettingsRoomNameListResponse> {

  const responseDefaultErrMsg = 'Failed to get data';

  try {
    const session: Session | null = await getAuthSession();
    // 途中フロントでサブメニューを操作しているので全量を取得してフロントに反映する
    const res = await BackendApiClient.get(
      vrmChatPath.room_settings_room_name_list+'?page=1&size='+(page*size)+'&ordering_desc_field_name=id',
      { headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${session?.user?.accessToken}`,
      }}
    );
    //  Axios は 2xx 以外で catch に飛ぶ
    
    // データの成形 ▽
    const items               = parseResponseData<RoomSettingsRoomNameListResponseItem>(res);
    const cleanData: ItemBase[] = items.map((item) => ({
      key:   item.roomId,
      label: item.roomName,
      href:  item.roomId,
    }));
    // データの成形 △
    const response: GetRoomSettingsRoomNameListResponse = {
      ok:     true,
      status: res.status,
      data:   cleanData,
    };
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {

      const status  = error.response.status;
      const errData = error.response.data;

      if (status === 429) {
        const response: GetRoomSettingsRoomNameListResponse = {
          ok:           false,
          status:       429,
          message:      'Please try again later',
          toastType:    'error',
          toastMessage: 'Please try again later',
        };
        return response;
      } else if (errData && Array.isArray(errData.errors) && errData.errors.length > 0) {
        const detailStr = errData.errors[0].detail ?? responseDefaultErrMsg;
        const response: GetRoomSettingsRoomNameListResponse = {
          ok:           false,
          status:       400, // 400しか返さない
          message:      String(detailStr),
          toastType:    'error',
          toastMessage: responseDefaultErrMsg,
        };
        return response;
      };
      const response: GetRoomSettingsRoomNameListResponse = {
        ok:           false,
        status:       400, // 400しか返さない
        message:      responseDefaultErrMsg,
        toastType:    'error',
        toastMessage: responseDefaultErrMsg,
      };
      return response;
    };
    // error.response が無い場合 (ネットワーク障害など)
    const response: GetRoomSettingsRoomNameListResponse = {
      ok:           false,
      status:       500,
      message:      responseDefaultErrMsg,
      toastType:    'error',
      toastMessage: responseDefaultErrMsg,
    };
    return response;
  };
};