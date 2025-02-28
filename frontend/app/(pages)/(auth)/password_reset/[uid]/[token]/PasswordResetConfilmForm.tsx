'use client';

// next-auth
import { getCsrfToken } from 'next-auth/react';
// next
import Link from 'next/link';
// react
import {
  useEffect,
  useRef,
  type ReactElement,
  type Dispatch,
  type SetStateAction,
} from 'react';
// pagesPath
import { pagesPath } from '@/features/paths/frontend';
// hookform
import {
  passwordSchema,
  resetPasswordConfilm,
  resetPasswordConfilmFormSchema,
  type ResetPasswordConfilmFormInputType
} from '@/features/api/accounts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from '@/app/components/ui/shadcn/form';
import { useCommonSubmit } from '@/app/hooks';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import { Button } from '@/app/components/ui/shadcn/button';
import { Alert, AlertTitle, AlertDescription } from '@/app/components/ui/shadcn/alert';
// icons
import { Loader2, CircleCheckBig } from 'lucide-react';
// hooks
import { usePasswordStrength } from '@/app/hooks';
// components
import { PasswordInputField } from '@/app/components/ui/form';
import { showToast } from '@/app/components/utils';
// lib
import { setupZxcvbnOptions } from '@/app/components/lib/zxcvbn-ts'
setupZxcvbnOptions(); // セットアップ
// import
import { type PasswordResetConfilmParams  } from './page';


// type
type PasswordResetConfilmFormProps = PasswordResetConfilmParams & {
  isSuccess:    boolean;
  setIsSuccess: Dispatch<SetStateAction<boolean>>;
  isSending:    boolean;
  setIsSending: Dispatch<SetStateAction<boolean>>;
  setErrorMsg:  Dispatch<SetStateAction<string>>;
};

// PasswordResetConfilmForm ▽
export function PasswordResetConfilmForm({
  uid,
  token,
  isSuccess,
  setIsSuccess,
  isSending,
  setIsSending,
  setErrorMsg,}: PasswordResetConfilmFormProps): ReactElement {

  // ++++++++++
  // form
  // - useForm
  const form = useForm<ResetPasswordConfilmFormInputType>({
    resolver: zodResolver(resetPasswordConfilmFormSchema),
    defaultValues: {
      new_password:    '',
      re_new_password: '',
    },
  });
  // - csrfToken
  const csrfToken = useRef<string>('');
  useEffect(() => {
    getCsrfToken().then((token) => {
      if (token) {
        csrfToken.current = token;
      };
    });
  }, [form]);
  // パスワード強度 ▽
  const watchNewPassword         = form.watch('new_password');
  const { score, strengthLabel } = usePasswordStrength({
    passwordValue:     watchNewPassword,
    passwordZodSchema: passwordSchema,
  });
  // パスワード強度 △
  // - useCommonSubmit
  const preHandleSubmit = async (data: ResetPasswordConfilmFormInputType) => {
    if (score < 3) {
      const msg = 'You need to set a more complex password'
      showToast('error', msg);
      setErrorMsg(msg);
      return;
    };
    await handleSubmit(data);
  };
  const handleSubmit = useCommonSubmit<ResetPasswordConfilmFormInputType>({
    isSending,
    setIsSending,
    setErrorMsg,
    submitFunction: async (data) => {
      return await resetPasswordConfilm({
        formData:  data,
        uid:       uid,
        token:     token,
        csrfToken: csrfToken.current,
      });
    },
    onSuccess: () => {
      form.reset(); // パスワード系は成功したらフォームリセット
      setIsSuccess(true);
    },
    defaultExceptionToastMessage: 'Password reset failed',
    defaultErrorMessage:          'Password reset failed',
  });
  // ++++++++++

  return isSuccess ? (
    <div className='space-y-4'>
      <Alert className='border-success text-success-foreground [&>svg]:text-success-foreground'>
        <CircleCheckBig className='size-4' />
        <AlertTitle>reset password</AlertTitle>
        <AlertDescription>
          <Link href={pagesPath.authPath.login.$url()}
                className='hover:underline hover:underline-offset-4'>
                  Please log in again from the login page
          </Link>
        </AlertDescription>
      </Alert>
    </div>
  ) : (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(preHandleSubmit)}>
        <div className='flex flex-col gap-6'>
          <div className='grid gap-2'>
            {/* new_password */}
            <FormField control = {form.control}
                       name    = 'new_password'
                       render  = {({ field }) => (
              <FormItem>
                <FormLabel htmlFor='new_password'>Password</FormLabel>
                <FormControl>
                  <PasswordInputField {...field}
                                      id           = 'new_password'
                                      className    = 'mt-2'
                                      autoComplete = 'new-password'
                                      required />
                </FormControl>
                <FormMessage />
                {/* パスワード強度表示 */}
                <div className='mt-1 flex items-center gap-1'>
                  {[...Array(4)].map((_, idx) => {
                    const isActive = idx < score;
                    let barColor = '';
                    if (score <= 1) {
                      barColor = 'bg-danger';
                    } else if (score === 2) {
                      barColor = 'bg-warning';
                    } else {
                      barColor = 'bg-success';
                    };
                    return (
                      <div key={idx}
                           className={cn(
                            'h-1 flex-1 rounded transition-all',
                            isActive ? barColor : 'bg-gray-200',)}/>
                    );
                  })}
                </div>
                <FormDescription className='mt-1 text-xs text-gray-600'>
                  password strength:<span className='ml-1 font-semibold'>{strengthLabel}</span>
                </FormDescription>
              </FormItem>
            )} />
          </div>
          <div className='grid gap-2'>
            {/* re_new_password */}
            <FormField control = {form.control}
                       name    = 're_new_password'
                       render  = {({ field }) => (
              <FormItem>
                <FormLabel htmlFor='re_new_password'>Password (Check)</FormLabel>
                <FormControl>
                  <PasswordInputField {...field}
                                      id           = 're_new_password'
                                      className    = 'mt-2'
                                      autoComplete = 'new-password'
                                      required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type      = 'submit'
                  className = 'w-full'
                  disabled  = {isSending}>
            {isSending ? <Loader2 className='animate-spin' /> : 'Password reset'}
          </Button>
        </div>
      </form>
    </Form>
  )
};
// PasswordResetConfilmForm △