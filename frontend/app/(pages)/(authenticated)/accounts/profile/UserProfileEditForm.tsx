'use client';

// next
import Image from 'next/image';
// react
import { useState, type ReactElement } from 'react';
// hookform
import {
  patchUserProfile,
  userProfileFormSchema,
  type UserProfileResponseData,
  type UserProfileFormInputType,
} from '@/features/api/user_properties';
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
import { Button } from '@/app/components/ui/shadcn/button';
import { Input } from '@/app/components/ui/shadcn/input';
import { Label } from '@/app/components/ui/shadcn/label';
import { Alert, AlertDescription } from '@/app/components/ui/shadcn/alert';
// icons
import { Loader2 } from 'lucide-react';
// components
import { CropperDialog, OverlaySpinner } from '@/app/components/utils';


// UserProfileEditForm
export function UserProfileEditForm({userProfileData,}: {userProfileData: UserProfileResponseData;}): ReactElement {

  // userIconUrl
  // - null の時はフロントのデフォルト画像を表示
  const userIconUrl = (userProfileData.userIcon && process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL)
                        ? (new URL(process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL).origin as string) + userProfileData.userIcon
                        : '/app/accounts/profile/user_icon/default/default.svg';

  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');
  const [userIconPreviewUrl, setUserIconPreviewUrl] = useState<string>(userIconUrl);

  // ++++++++++
  // form
  // - useForm
  const form = useForm<UserProfileFormInputType>({
    resolver: zodResolver(userProfileFormSchema),
    defaultValues: {
      display_name: userProfileData.displayName,
      user_icon:    null,
    },
  });
  // - useCommonSubmit
  const handleSubmit = useCommonSubmit<UserProfileFormInputType>({
    isSending,
    setIsSending,
    setErrorMsg,
    submitFunction: async (data) => {
      // multipart/form-data 用 ▽
      const formData = new FormData();
      formData.append('display_name', data.display_name);
      if (data.user_icon instanceof File) {
        formData.append('user_icon', data.user_icon);
      };
      // multipart/form-data 用 △
      return await patchUserProfile({
        formData: formData,
      });
    },
    defaultExceptionToastMessage: 'Update failed',
    defaultErrorMessage:          'Update failed',
  });
  // - Cropper
  //   - CropperDialog からファイル受け取り
  const handleCropped = (croppedFile: File) => {
    form.setValue('user_icon', croppedFile);
    setUserIconPreviewUrl(URL.createObjectURL(croppedFile));
  };
  //   - clear
  const handleClear = () => {
    form.setValue('user_icon', null);
    setUserIconPreviewUrl(userIconUrl);
  };
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
        <form onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-6'>

          {/* user_icon (Preview) */}
          <div className='flex flex-col gap-2'>
            <Label className='text-left text-sm font-semibold text-foreground/80'>
              Profile picture
            </Label>
            <div className='relative mx-auto size-[200px] select-none overflow-hidden rounded-full border'>
              <Image src       = {userIconPreviewUrl}
                     alt       = 'icon preview'
                     width     = {200}
                     height    = {200}
                     className = 'object-cover' />
            </div>
          </div>
          {/* user_icon (CropperDialog) */}
          <div className='flex flex-col gap-1'>
            <div className='flex w-full items-center gap-2'>
              <CropperDialog onCropped = {handleCropped}
                             className = 'flex-1 border-muted-foreground' />
              <Button variant   = 'outline'
                      type      = 'button'
                      className = 'bg-secondary'
                      onClick   = {handleClear}>
                clear
              </Button>
            </div>
            <FormDescription className='text-xs text-muted-foreground'>
              Resized to 200 (px) x 200 (px)
            </FormDescription>
          </div>

          {/* display_name (Input) */}
          <FormField control = {form.control}
                     name    = 'display_name'
                     render  = {({ field }) => (
              <FormItem>
                <FormLabel htmlFor='display_name'>username</FormLabel>
                <FormControl>
                  <Input {...field}
                         id          = 'display_name'
                         className   = 'border-muted-foreground'
                         placeholder = '' />
                </FormControl>
                <FormDescription className='mt-1 text-xs text-muted-foreground'>
                  Half-width alphanumeric characters 25 characters or less
                </FormDescription>
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