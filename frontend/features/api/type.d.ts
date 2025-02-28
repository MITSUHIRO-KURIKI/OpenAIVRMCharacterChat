import { ToastType } from '@/app/components/utils/showToast';

export type DefaultResponse = {
  ok:            boolean;
  status:        number;
  message?:      string;
  toastType?:    ToastType;
  toastMessage?: string;
};