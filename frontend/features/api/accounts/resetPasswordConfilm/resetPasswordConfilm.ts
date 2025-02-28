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
import { type ResetPasswordConfilmFormInputType } from './schema';
import type { DefaultResponse } from '@/features/api';

// type
type PasswordResetConfilmRequest = {
  formData:  ResetPasswordConfilmFormInputType;
  uid:       string;
  token:     string;
  csrfToken: string;
};

// resetPasswordConfilm
export async function resetPasswordConfilm({ formData, uid, token, csrfToken }: PasswordResetConfilmRequest): Promise<DefaultResponse> {

  const responseDefaultErrMsg = 'Password reset failed';

  try {
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
      accountsPath.reset_password_confirm,
      {
        ...formData,
        uid,
        token,
      },
      { headers: { 'Content-Type': 'application/json', }},
    );
    //  Axios は 2xx 以外で catch に飛ぶ
    const response: DefaultResponse = {
      ok:           true,
      status:       res.status,
      message:      'sent you an email to reset your settings.',
      toastType:    'success',
      toastMessage: 'sent you an email to reset your settings.',
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