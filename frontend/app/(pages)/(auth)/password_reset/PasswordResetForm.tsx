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
  resetPassword,
  passwordResetFormSchema,
  type PasswordResetFormInputType
} from '@/features/api/accounts/resetPassword';
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
import { Input } from '@/app/components/ui/shadcn/input';
import { Button } from '@/app/components/ui/shadcn/button';
import { Alert, AlertTitle, AlertDescription } from '@/app/components/ui/shadcn/alert';
// icons
import { Loader2, CircleCheckBig } from 'lucide-react';


// type
type PasswordResetFormProps = {
  isSuccess:    boolean;
  setIsSuccess: Dispatch<SetStateAction<boolean>>;
  isSending:    boolean;
  setIsSending: Dispatch<SetStateAction<boolean>>;
  setErrorMsg:  Dispatch<SetStateAction<string>>;
};

// PasswordResetForm ▽
export function PasswordResetForm({
  isSuccess,
  setIsSuccess,
  isSending,
  setIsSending,
  setErrorMsg,}: PasswordResetFormProps): ReactElement {

  // ++++++++++
  // form
  // - useForm
  const form = useForm<PasswordResetFormInputType>({
    resolver: zodResolver(passwordResetFormSchema),
    defaultValues: {
      email:     '',
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
  // - useCommonSubmit
  const handleSubmit = useCommonSubmit<PasswordResetFormInputType>({
    isSending,
    setIsSending,
    setErrorMsg,
    submitFunction: async (data) => {
      return await resetPassword({
        formData:  data,
        csrfToken: csrfToken.current,
      });
    },
    onSuccess: () => {
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
        <AlertTitle>sent you a password reset email.</AlertTitle>
        <AlertDescription>Please reset your password using the email sent to you.</AlertDescription>
      </Alert>
      <p className='select-none text-xs leading-none text-muted-foreground'>
        ※If you do not receive an email, the email address you entered may be incorrect. We apologize for the inconvenience, but please try resetting your password again.
      </p>
    </div>
  ) : (
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
// PasswordResetForm △