'use client';

// next-auth
import { getCsrfToken } from 'next-auth/react';
// react
import {
  useEffect,
  useRef,
  type ReactElement,
  type Dispatch,
  type SetStateAction,
} from 'react';
// hookform
import {
  signup,
  signupFormSchema,
  type SignupFormInputType
} from '@/features/api/accounts/signup';
import { passwordSchema } from '@/features/api/accounts';
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
import { Input } from '@/app/components/ui/shadcn/input';
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


// type
type SignupFormProps = {
  isSuccess:    boolean;
  setIsSuccess: Dispatch<SetStateAction<boolean>>;
  isSending:    boolean;
  setIsSending: Dispatch<SetStateAction<boolean>>;
  setErrorMsg:  Dispatch<SetStateAction<string>>;
};

// SignupForm ▽
export function SignupForm({
  isSuccess,
  setIsSuccess,
  isSending,
  setIsSending,
  setErrorMsg,}: SignupFormProps): ReactElement {

  // ++++++++++
  // form
  // - useForm
  const form = useForm<SignupFormInputType>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email:       '',
      password:    '',
      re_password: '',
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
  const watchNewPassword         = form.watch('password');
  const { score, strengthLabel } = usePasswordStrength({
    passwordValue:     watchNewPassword,
    passwordZodSchema: passwordSchema,
  });
  // パスワード強度 △
  // - useCommonSubmit
  const preHandleSubmit = async (data: SignupFormInputType) => {
    if (score < 3) {
      const msg = 'You need to set a more complex password'
      showToast('error', msg);
      setErrorMsg(msg);
      return;
    };
    await handleSubmit(data);
  };
  const handleSubmit = useCommonSubmit<SignupFormInputType>({
    isSending,
    setIsSending,
    setErrorMsg,
    submitFunction: async (data) => {
      return await signup({
        formData:   data,
        csrfToken:  csrfToken.current,
      });
    },
    onSuccess: () => {
      form.reset(); // パスワード系は成功したらフォームリセット
      setIsSuccess(true);
    },
    defaultExceptionToastMessage: 'Sign up failed',
    defaultErrorMessage:          'Sign up failed',
  });
  // ++++++++++

  return isSuccess ? (
    <div className="space-y-4">
      <Alert className="border-success text-success-foreground [&>svg]:text-success-foreground">
        <CircleCheckBig className='size-4' />
        <AlertTitle>We have accepted your provisional registration.</AlertTitle>
        <AlertDescription>Please complete the authentication from the email sent.</AlertDescription>
      </Alert>
      <p className='select-none text-xs leading-none text-muted-foreground'>
        ※If you do not receive an email, the email address you entered may be incorrect. We apologize for the inconvenience, but please try registering again.
      </p>
    </div>
  ) : (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(preHandleSubmit)}>
        <div className='flex flex-col gap-6'>
          <div className='grid gap-2'>
            {/* email */}
            <FormField control = {form.control}
                       name    = 'email'
                       render  = {({ field }) => (
              <FormItem>
                <FormLabel htmlFor='email'>Email</FormLabel>
                <FormControl>
                  <Input {...field}
                         type         = 'email'
                         id           = 'email'
                         className    = 'mt-2'
                         autoComplete = 'username'
                         autoFocus
                         required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <div className='grid gap-2'>
            {/* password */}
            <FormField control = {form.control}
                       name    = 'password'
                       render  = {({ field }) => (
            <FormItem>
                <FormLabel htmlFor='password'>Password</FormLabel>
                <FormControl>
                  <PasswordInputField {...field}
                                      id           = 'password'
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
            {/* rePassword */}
            <FormField control = {form.control}
                       name    = 're_password'
                       render  = {({ field }) => (
            <FormItem>
                <FormLabel htmlFor='rePassword'>Password (Check)</FormLabel>
                <FormControl>
                  <PasswordInputField {...field}
                                      id           = 're_password'
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
            {isSending ? <Loader2 className='animate-spin' /> : 'Sign up'}
          </Button>
        </div>
      </form>
    </Form>
  )
};
// SignupForm △