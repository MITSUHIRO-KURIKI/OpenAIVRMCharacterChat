'use client';

// next-auth
import { signOut } from 'next-auth/react';
// react
import { useState, type ReactElement } from 'react';
// paths
import { apiPath, pagesPath } from '@/features/paths/frontend';
// hookform
import {
  passwordSchema,
  setPassword,
  setPasswordFormSchema,
  type SetPasswordFormInputType,
} from '@/features/api/accounts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormDescription,
  FormItem,
  FormMessage,
} from '@/app/components/ui/shadcn/form';
import { useCommonSubmit } from '@/app/hooks';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import { Button } from '@/app/components/ui/shadcn/button';
import { Alert, AlertDescription } from '@/app/components/ui/shadcn/alert';
// icons
import { Loader2 } from 'lucide-react';
// features
import { UrlToString } from '@/features/utils';
import { FrontendWithCredentialsApiClient } from '@/features/apiClients';
// hooks
import { usePasswordStrength } from '@/app/hooks';
// components
import { PasswordInputField } from '@/app/components/ui/form';
import { showToast, OverlaySpinner } from '@/app/components/utils';
// lib
import { setupZxcvbnOptions } from '@/app/components/lib/zxcvbn-ts'
setupZxcvbnOptions(); // セットアップ


// PasswordChangeForm
export function PasswordChangeForm(): ReactElement {

  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');

  // ++++++++++
  // form
  // - useForm
  const form = useForm<SetPasswordFormInputType>({
    resolver: zodResolver(setPasswordFormSchema),
    defaultValues: {
      current_password: '',
      new_password:     '',
      re_new_password:  '',
    },
  });
  // パスワード強度 ▽
  const watchNewPassword         = form.watch('new_password');
  const { score, strengthLabel } = usePasswordStrength({
    passwordValue:     watchNewPassword,
    passwordZodSchema: passwordSchema,
  });
  // パスワード強度 △
  const preHandleSubmit = async (data: SetPasswordFormInputType) => {
    if (score < 3) {
      const msg = 'You need to set a more complex password'
      showToast('error', msg);
      setErrorMsg(msg);
      return;
    };
    await handleSubmit(data);
  };
  const handleSubmit = useCommonSubmit<SetPasswordFormInputType>({
    isSending,
    setIsSending,
    setErrorMsg,
    submitFunction: async (data) => {
      return await setPassword({
        formData: data,
      });
    },
    onSuccess: () => {
      form.reset(); // パスワード系は成功したらフォームリセット
    },
    defaultExceptionToastMessage: 'Password change failed',
    defaultErrorMessage:          'Password change failed',
  });
  // ++++++++++

  return (
    <>
      {/* OverlaySpinner */}
      <OverlaySpinner isActivate={isSending} />

      {/* Alert */}
      {errorMsg && (
        <Alert variant='destructive' className='mb-4'>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}
      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(preHandleSubmit)}
              className='space-y-6'>

          {/* current_password (Input) */}
          <FormField control = {form.control}
                     name    = 'current_password'
                     render  = {({ field }) => (
              <FormItem>
                <div className='flex items-center'>
                  <FormLabel htmlFor='current_password'>current password</FormLabel>
                  <Button type      = 'button'
                          variant   = 'linelink'
                          size      = 'fit'
                          className = {cn(
                            'ml-auto inline-block',
                          )}
                          onClick = {async (e) => {
                            e.preventDefault();
                            await FrontendWithCredentialsApiClient.post(apiPath.authPath.logout);
                            await signOut({
                              callbackUrl: UrlToString(pagesPath.authPath.password_reset.$url()), 
                            });
                          }}>
                    Forgot your password?
                  </Button>
                </div>
                <FormControl>
                  <PasswordInputField {...field}
                                      id           = 'current_password'
                                      className    = 'border-muted-foreground'
                                      autoComplete = 'current-password'
                                      required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

          {/* new_password (Input) */}
          <FormField control = {form.control}
                     name    = 'new_password'
                     render  = {({ field }) => (
              <FormItem>
                <FormLabel htmlFor='new_password'>new password</FormLabel>
                <FormControl>
                  <PasswordInputField {...field}
                                      id           = 'new_password'
                                      className    = 'border-muted-foreground'
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

          {/* re_new_password (Input) */}
          <FormField control = {form.control}
                     name    = 're_new_password'
                     render  = {({ field }) => (
              <FormItem>
                <FormLabel htmlFor='re_new_password'>new password (Check)</FormLabel>
                <FormControl>
                  <PasswordInputField {...field}
                                      id           = 're_new_password'
                                      className    = 'border-muted-foreground'
                                      autoComplete = 'new-password'
                                      required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

          <Button type      = 'submit'
                  className = 'w-full'
                  disabled  = {isSending}>
            {isSending ? <Loader2 className='animate-spin' /> : 'Update settings'}
          </Button>
        </form>
      </Form>
    </>
  );
};