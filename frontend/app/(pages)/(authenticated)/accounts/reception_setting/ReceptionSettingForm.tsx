'use client';

// react
import { useState, type ReactElement } from 'react';
// hookform
import {
  patchUserReceptionSetting,
  userReceptionSettingFormSchema,
  type userReceptionSettingFormInputType,
  type UserReceptionSettingResponseData,
} from '@/features/api/user_properties';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormItem,
  FormMessage,
} from '@/app/components/ui/shadcn/form';
import { useCommonSubmit } from '@/app/hooks';
// shadcn
import { Button } from '@/app/components/ui/shadcn/button';
import { Switch } from '@/app/components/ui/shadcn/switch';
import { Label } from '@/app/components/ui/shadcn/label';
import { Alert, AlertDescription } from '@/app/components/ui/shadcn/alert';
// icons
import { Loader2 } from 'lucide-react';
// components
import { OverlaySpinner } from '@/app/components/utils';


// ReceptionSettingForm
export function ReceptionSettingForm({ userReceptionSettingData }: {userReceptionSettingData: UserReceptionSettingResponseData}): ReactElement {

  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');

  // ++++++++++
  // form
  // - useForm
  const form = useForm<userReceptionSettingFormInputType>({
    resolver: zodResolver(userReceptionSettingFormSchema),
    defaultValues: {
      is_receive_all:            userReceptionSettingData.isReceiveAll,
      is_receive_important_only: userReceptionSettingData.isReceiveImportantOnly,
    },
  });
  // - フォームの内容に応じた変更 (ボタンのどちらかをチェック状態にする)
  const { setValue } = form;
  // - useCommonSubmit
  const handleSubmit = useCommonSubmit<userReceptionSettingFormInputType>({
    isSending,
    setIsSending,
    setErrorMsg,
    submitFunction: async (data) => {
      return await patchUserReceptionSetting({
        formData: data,
      });
    },
    defaultExceptionToastMessage: 'Update failed',
    defaultErrorMessage:          'Update failed',
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
        <form onSubmit={form.handleSubmit(handleSubmit)}>

          <Label className='mb-4 block text-lg font-bold'>Notification reception settings</Label>

          {/* is_receive_all (Switch) */}
          <FormField control = {form.control}
                     name    = 'is_receive_all'
                     render  = {({ field }) => (
              <FormItem className='my-2 flex items-center space-x-2 space-y-0'>
                <FormLabel htmlFor='is_receive_all'>Receive all emails</FormLabel>
                <FormControl>
                  <Switch id              = 'is_receive_all'
                          className       = 'border-muted-foreground'
                          checked         = {field.value}
                          onCheckedChange = {(checked) => {
                            // こちらがONになったら、もう片方をOFFにする
                            if (checked)  setValue('is_receive_important_only', false);
                            if (!checked) setValue('is_receive_important_only', true);
                            field.onChange(checked);
                          }} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

          {/* is_receive_important_only (Switch) */}
          <FormField control = {form.control}
                     name    = 'is_receive_important_only'
                     render  = {({ field }) => (
              <FormItem className='my-2 flex items-center space-x-2 space-y-0'>
                <FormLabel htmlFor='is_receive_important_only'>Receive only important emails</FormLabel>
                <FormControl>
                  <Switch id              = 'is_receive_important_only'
                          className       = 'border-muted-foreground'
                          checked         = {field.value}
                          onCheckedChange = {(checked) => {
                            // こちらがONになったら、もう片方をOFFにする
                            if (checked)  setValue('is_receive_all', false);
                            if (!checked) setValue('is_receive_all', true);
                            field.onChange(checked);
                          }} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

          <Button type      = 'submit'
                  className = 'mt-6 w-full'
                  disabled  = {isSending}>
            {isSending ? <Loader2 className='animate-spin' /> : 'Update settings'}
          </Button>
        </form>
      </Form>
    </>
  );
};