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
import type {
  RoomSettingsFormInputType,
  RoomSettingsRoomNameChangeInputType,
} from './schema';
import type { RoomSettingsResponseData } from './type.d';
import type { DefaultResponse } from '@/features/api';

// type
type PatchRoomSettingsRequest = {
  roomId:   string;
  formData: RoomSettingsFormInputType;
};
type PatchRoomSettingsRoomNameChangeRequest = {
  roomId:   string;
  formData: RoomSettingsRoomNameChangeInputType;
};
type PatchRoomSettingsResponse = DefaultResponse & {
  data?: RoomSettingsResponseData;
};
  
// patchRoomSettings
export async function patchRoomSettings({ roomId, formData }: PatchRoomSettingsRequest): Promise<PatchRoomSettingsResponse> {

  const responseDefaultErrMsg = 'Update failed';

  try {
    const session: Session | null = await getAuthSession();

    const res = await BackendApiClient.patch(
      vrmChatPath.room_settings+roomId,
      formData,
      { headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${session?.user?.accessToken}`,
      }}
    );

    //  Axios は 2xx 以外で catch に飛ぶ
    const data:RoomSettingsResponseData = res.data;
    const response: PatchRoomSettingsResponse = {
      ok:           true,
      status:       res.status,
      data:         data,
      message:      'Updated',
      toastType:    'success',
      toastMessage: 'Updated',
    };
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {

      const status  = error.response.status;
      const errData = error.response.data;

      if (status === 429) {
        const response: PatchRoomSettingsResponse = {
          ok:           false,
          status:       429,
          message:      'Please try again later',
          toastType:    'error',
          toastMessage: 'Please try again later',
        };
        return response;
      } else if (errData && Array.isArray(errData.errors) && errData.errors.length > 0) {
        const detailStr = errData.errors[0].detail ?? responseDefaultErrMsg;
        const response: PatchRoomSettingsResponse = {
          ok:           false,
          status:       400, // 400しか返さない
          message:      String(detailStr),
          toastType:    'error',
          toastMessage: responseDefaultErrMsg,
        };
        return response;
      };
      const response: PatchRoomSettingsResponse = {
        ok:           false,
        status:       400, // 400しか返さない
        message:      responseDefaultErrMsg,
        toastType:    'error',
        toastMessage: responseDefaultErrMsg,
      };
      return response;
    };
    // error.response が無い場合 (ネットワーク障害など)
    const response: PatchRoomSettingsResponse = {
      ok:           false,
      status:       500,
      message:      responseDefaultErrMsg,
      toastType:    'error',
      toastMessage: responseDefaultErrMsg,
    };
    return response;
  };
};

// patchRoomSettingsRoomNameChange
export async function patchRoomSettingsRoomNameChange({ roomId, formData }: PatchRoomSettingsRoomNameChangeRequest): Promise<PatchRoomSettingsResponse> {

  const responseDefaultErrMsg = 'Update failed';

  try {
    const session: Session | null = await getAuthSession();

    const res = await BackendApiClient.patch(
      vrmChatPath.room_settings+roomId,
      formData,
      { headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${session?.user?.accessToken}`,
      }}
    );

    //  Axios は 2xx 以外で catch に飛ぶ
    const response: PatchRoomSettingsResponse = {
      ok:           true,
      status:       res.status,
    };
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {

      const status  = error.response.status;
      const errData = error.response.data;

      if (status === 429) {
        const response: PatchRoomSettingsResponse = {
          ok:           false,
          status:       429,
          message:      'Please try again later',
          toastType:    'error',
          toastMessage: 'Please try again later',
        };
        return response;
      } else if (errData && Array.isArray(errData.errors) && errData.errors.length > 0) {
        const detailStr = errData.errors[0].detail ?? responseDefaultErrMsg;
        const response: PatchRoomSettingsResponse = {
          ok:           false,
          status:       400, // 400しか返さない
          message:      String(detailStr),
          toastType:    'error',
          toastMessage: responseDefaultErrMsg,
        };
        return response;
      };
      const response: PatchRoomSettingsResponse = {
        ok:           false,
        status:       400, // 400しか返さない
        message:      responseDefaultErrMsg,
        toastType:    'error',
        toastMessage: responseDefaultErrMsg,
      };
      return response;
    };
    // error.response が無い場合 (ネットワーク障害など)
    const response: PatchRoomSettingsResponse = {
      ok:           false,
      status:       500,
      message:      responseDefaultErrMsg,
      toastType:    'error',
      toastMessage: responseDefaultErrMsg,
    };
    return response;
  };
};