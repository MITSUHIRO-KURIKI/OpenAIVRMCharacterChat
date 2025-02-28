'use client';

// react
import { useCallback } from 'react';
// components
import { showToast } from '@/app/components/utils';
// type
import type { DefaultResponse } from '@/features/api';

// type
type SubmitFunctionReturn = {
  [key: string]: unknown;
  } & DefaultResponse;
type UseCommonSubmitOptions<T> = {
  isSending?:     boolean;
  setIsSending?:  (b: boolean) => void;
  setErrorMsg?:   (msg: string) => void;
  // 実際にフォームデータを送信する関数
  submitFunction: (formData: T) => Promise<SubmitFunctionReturn>;
  // 成功/失敗/例外/終了時コールバック
  onSuccess?:   (result: SubmitFunctionReturn, formData: T) => void;
  onError?:     (result: SubmitFunctionReturn, formData: T) => void;
  onException?: (error: unknown) => void;
  onFinish?:    ()=> void;
  // エラー文言
  defaultErrorMessage?:          string;
  defaultExceptionToastMessage?: string;
  defaultExceptionMessage?:      string;
};

// useCommonSubmit
// - 送信処理を共通化するカスタムフック
export function useCommonSubmit<T>({
  isSending,
  setIsSending,
  setErrorMsg,
  submitFunction,
  onSuccess,
  onError,
  onException,
  onFinish,
  defaultErrorMessage          = '',
  defaultExceptionToastMessage = 'error',
  defaultExceptionMessage      = 'An error has occurred',
  }: UseCommonSubmitOptions<T>) {

  const handleSubmit = useCallback(async (submitData: T) => {

    // 多重送信防止
    if (isSending) return;

    if (setIsSending) setIsSending(true);
    if (setErrorMsg)  setErrorMsg('');
    try {
      const result: SubmitFunctionReturn = await submitFunction(submitData);

      if (result?.toastType) {
        showToast(result?.toastType, result?.toastMessage, {duration: 5000});
      };

      if (result.ok) {
        onSuccess?.(result, submitData);
      } else {
        if (setErrorMsg) setErrorMsg(result?.message || defaultErrorMessage);
        onError?.(result, submitData);
      };
    } catch (error) {
      showToast('error', defaultExceptionToastMessage);
      if (setErrorMsg) setErrorMsg(defaultExceptionMessage);
      onException?.(error);
    } finally {
      // 多重送信防止
      if (setIsSending) setIsSending(false);
      onFinish?.();
    };
  }, [
    isSending,
    setIsSending,
    setErrorMsg,
    submitFunction,
    onSuccess,
    onError,
    onException,
    onFinish,
    defaultErrorMessage,
    defaultExceptionToastMessage,
    defaultExceptionMessage,
  ]);

  return handleSubmit;
};