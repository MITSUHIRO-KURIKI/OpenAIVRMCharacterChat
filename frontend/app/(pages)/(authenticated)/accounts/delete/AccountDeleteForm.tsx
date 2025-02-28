'use client';

// next-auth
import { signOut } from 'next-auth/react';
// react
import {
  useState,
  type ReactElement,
  ChangeEvent,
} from 'react';
// paths
import { apiPath, pagesPath } from '@/features/paths/frontend';
// shadcn
import { Input } from '@/app/components/ui/shadcn/input';
import { Button } from '@/app/components/ui/shadcn/button';
import { Label } from '@/app/components/ui/shadcn/label';
import { Alert, AlertDescription } from '@/app/components/ui/shadcn/alert';
// icons
import { Loader2, CircleAlert } from 'lucide-react';
// features
import { deleteAccount } from '@/features/api/accounts';
import { FrontendWithCredentialsApiClient } from '@/features/apiClients';
// hooks
import { useCommonSubmit } from '@/app/hooks';
// components
import { showToast, OverlaySpinner } from '@/app/components/utils';


// AccountDeleteForm
export function AccountDeleteForm(): ReactElement {

  const [isSending, setIsSending]               = useState(false);
  const [errorMsg, setErrorMsg]                 = useState('');
  const [safetyCheckInput, setSafetyCheckInput] = useState<string>('');

  // - useCommonSubmit
  const preHandleSubmit = async (): Promise<void> => {
    // SafetyCheck
    if (safetyCheckInput !== 'delete') {
      showToast('error', 'error');
      setErrorMsg('Type &quot;delete&quot; to perform the deletion');
      return;
    };
    await handleSubmit();
  };
  const handleSubmit = useCommonSubmit<void>({
    isSending,
    setIsSending,
    setErrorMsg,
    submitFunction: async () => {
      return await deleteAccount();
    },
    onSuccess: async () => {
      // ログアウトしてトップに戻る
      await FrontendWithCredentialsApiClient.post(apiPath.authPath.logout);
      await signOut({callbackUrl: pagesPath.$url(),});
    },
    defaultExceptionToastMessage: 'Deletion failed',
    defaultErrorMessage:          'Deletion failed',
  });

  return (
    <>
      {/* OverlaySpinner */}
      <OverlaySpinner isActivate={isSending} />

      <Label className='mb-4 block text-lg font-bold'>Delete account</Label>

      <Alert variant='destructive'>
        <AlertDescription className='flex items-center'>
          <CircleAlert className='mr-2 size-6' /><p>This operation cannot be undone.</p>
        </AlertDescription>
      </Alert>

      <div className = 'my-6'>
          { errorMsg ? (
            <p className = 'mb-2 select-none text-sm text-destructive'>
              {errorMsg}
            </p>
          ) : (
            <p className = 'mb-2 select-none text-sm'>
              Please enter &quot;delete&quot;
            </p>
          )}
          <Label htmlFor='safetyCheck' className='sr-only'>Check</Label>
          <Input type         = 'text'
                 id           = 'safetyCheck'
                 className    = 'border-muted-foreground'
                 value        = {safetyCheckInput}
                 onChange     = {(e: ChangeEvent<HTMLInputElement>) => {setSafetyCheckInput(e.target.value);}}
                 placeholder  = 'delete'
                 autoComplete = 'off' />
      </div>

      <Button variant   = 'destructive'
              className = 'mt-4 w-full '
              onClick   = {preHandleSubmit}
              disabled  = {isSending} >
        {isSending ? (<Loader2 className='animate-spin' />) : ('Delete your account')}
      </Button>
    </>
  );
};