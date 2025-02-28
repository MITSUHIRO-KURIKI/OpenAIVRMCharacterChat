'use server';

// next
import { NextResponse } from 'next/server';
// lib
import axios from 'axios';
// paths
import { accountsPath } from '@/features/paths/backend';
// features
import { BackendApiClient } from '@/features/apiClients';
import { csrfValidatorForCookie } from '@/features/utils';
import { cookies } from 'next/headers';
// type
import type { DefaultResponse } from '@/features/api';

// type
export type ActivationParams = {
  uid:   string;
  token: string;
};
type ActivationRequest = {
  formData:  ActivationParams;
  csrfToken: string;
};


// activation
export async function activation({ formData, csrfToken }: ActivationRequest): Promise<DefaultResponse> {

  const responseDefaultErrMsg = 'Authentication error';

  try{
    // CSRFチェック ▽
    const cookieStore = await cookies();
    const allCookies  = cookieStore.getAll();
    const csrfResult: NextResponse | undefined = csrfValidatorForCookie(allCookies, csrfToken);
    if (!csrfResult?.ok) {
      const response: DefaultResponse = {
        ok:           false,
        status:       400,
        message:      responseDefaultErrMsg,
        toastType:    'error',
        toastMessage: responseDefaultErrMsg,
      };
      return response;
    };
    // CSRFチェック △

    const res = await BackendApiClient.post(
      accountsPath.activation,
      formData,
      { headers: { 'Content-Type': 'application/json', }},
    );
    //  Axios は 2xx 以外で catch に飛ぶ
    const response: DefaultResponse = {
      ok:           true,
      status:       res.status,
      message:      'This registration has been completed',
      toastType:    'success',
      toastMessage: 'This registration has been completed',
    };
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {

      const status  = error.response.status;
      const errData = error.response.data;

      if (status === 429) {
        const response: DefaultResponse = {
          ok:           false,
          status:       429,
          message:      'Please try again later',
          toastType:    'error',
          toastMessage: 'Please try again later',
        };
        return response;
      } else if (errData && Array.isArray(errData.errors) && errData.errors.length > 0) {
        const detailStr = errData.errors[0].detail ?? responseDefaultErrMsg;
        const response: DefaultResponse = {
          ok:           false,
          status:       400, // 400しか返さない
          message:      String(detailStr),
          toastType:    'error',
          toastMessage: responseDefaultErrMsg,
        };
        return response;
      };
      const response: DefaultResponse = {
        ok:           false,
        status:       400, // 400しか返さない
        message:      responseDefaultErrMsg,
        toastType:    'error',
        toastMessage: responseDefaultErrMsg,
      };
      return response;
    };
    // error.response が無い場合 (ネットワーク障害など)
    const response: DefaultResponse = {
      ok:           false,
      status:       500,
      message:      responseDefaultErrMsg,
      toastType:    'error',
      toastMessage: responseDefaultErrMsg,
    };
    return response;
  };
};