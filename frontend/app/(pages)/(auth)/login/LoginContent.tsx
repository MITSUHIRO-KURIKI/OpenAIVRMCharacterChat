'use client';

// next
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
// react
import { useState, type ReactElement } from 'react';
// pagesPath
import { pagesPath } from '@/features/paths/frontend';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/shadcn/card';
import { Alert, AlertDescription } from '@/app/components/ui/shadcn/alert';
// features
import { sanitizeRedirectUrl, UrlToString } from '@/features/utils';
// components
import { OverlaySpinner } from '@/app/components/utils';
// include
import { LoginForm } from './LoginForm';


export function LoginContent(): ReactElement {
  const [isSending, setIsSending] = useState<boolean>(false);
  const [errorMsg, setErrorMsg]   = useState<string>('');

  // callback
  const searchParams = useSearchParams();
  const callbackUrl  = sanitizeRedirectUrl(searchParams.get('next')) ?? UrlToString(pagesPath.servicesPath.vrmChat.$url());

  return (
    <div className='grid lg:grid-cols-1'>

      <div className={cn(
        'flex min-h-svh flex-col w-full justify-center',)}>
        {/* OverlaySpinner */}
        <OverlaySpinner isActivate={isSending} />
        {/* logo */}
        <div className={cn(
          'invisible lg:visible',
          'flex justify-center p-4',
          'select-none',
          'md:justify-start',)}>
          <Link href={pagesPath.$url()} className='font-bold'>
            {process.env.NEXT_PUBLIC_SITE_NAME as string}
          </Link>
        </div>
        {/* main */}
        <div className='flex flex-1 items-center justify-center'>
          <div className='w-full max-w-lg'>
            <div className='flex flex-col gap-4'>
              {/* logo */}
              <div className={cn(
                'visible lg:invisible',
                'select-none',
                'flex justify-center',)}>
                <Link href={pagesPath.$url()} className='font-bold'>
                  {process.env.NEXT_PUBLIC_SITE_NAME as string}
                </Link>
              </div>
              {/* Card */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-2xl'>Login</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Alert */}
                  { errorMsg && (
                    <Alert variant   = 'destructive'
                          className = 'mb-4'>
                      <AlertDescription>
                        {errorMsg}
                      </AlertDescription>
                    </Alert>
                  )}
                  <LoginForm
                    isSending    = {isSending}
                    setIsSending = {setIsSending}
                    setErrorMsg  = {setErrorMsg}
                    callbackUrl  = {callbackUrl} />
                </CardContent>
              </Card>
              {/* Foot */}
              <div className='text-center text-sm'>
                <Link href      = {pagesPath.authPath.signup.$url()}
                      className = 'select-none hover:underline hover:underline-offset-4'>
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};