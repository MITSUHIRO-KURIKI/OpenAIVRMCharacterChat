// next
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// react
import type { ReactElement, Dispatch, SetStateAction } from 'react';
// paths
import { pagesPath } from '@/features/paths/frontend';
// hookform
import {
  login,
  loginFormSchema,
  type LoginFormInputType
} from '@/features/api/token';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from '@/app/components/ui/shadcn/form';
import { useCommonSubmit } from '@/app/hooks';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import { Input } from '@/app/components/ui/shadcn/input';
import { Button } from '@/app/components/ui/shadcn/button';
// icons
import { Loader2 } from 'lucide-react';
// components
import { PasswordInputField } from '@/app/components/ui/form';


type LoginFormProps = {
  isSending:    boolean;
  setIsSending: Dispatch<SetStateAction<boolean>>;
  setErrorMsg:  Dispatch<SetStateAction<string>>;
  callbackUrl:  string;
};

// LoginForm ▽
export function LoginForm({
  isSending,
  setIsSending,
  setErrorMsg,
  callbackUrl,}: LoginFormProps): ReactElement {

  const router = useRouter();

  // ++++++++++
  // form
  // - useForm
  const form = useForm<LoginFormInputType>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email:    '',
      password: '',
    },
  });
  // - useCommonSubmit
  const handleSubmit = useCommonSubmit<LoginFormInputType>({
    isSending,
    setIsSending,
    setErrorMsg,
    submitFunction: async (data) => {
      return await login({
        formData:    data,
        callbackUrl: callbackUrl,
      });
    },
    onSuccess: () => {
      // 成功時 → リダイレクト
      router.push(callbackUrl);
    },
    defaultExceptionToastMessage: 'login failed',
    defaultErrorMessage:          'login failed',
  });
  // ++++++++++

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
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
            <div className='flex items-center'>
              <FormLabel htmlFor='password'>Password</FormLabel>
              <Link href      = {pagesPath.authPath.password_reset.$url()}
                    className = {cn(
                      'ml-auto inline-block text-sm underline-offset-4',
                      'hover:underline',)}>
                Forgot your password?
              </Link>
            </div>
            {/* password */}
            <FormField control = {form.control}
                       name    = 'password'
                       render  = {({ field }) => (
              <FormItem>
                <FormControl>
                  <PasswordInputField {...field}
                                      id           = 'password'
                                      className    = 'mt-2'
                                      autoComplete = 'current-password'
                                      required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type      = 'submit'
                  className = 'w-full'
                  disabled  = {isSending}>
            {isSending ? <Loader2 className='animate-spin' /> : 'Login'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
// LoginForm △