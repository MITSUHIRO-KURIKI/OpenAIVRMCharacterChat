'use client';

// react
import {
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
  type ReactElement,
} from 'react';
// hookform
import {
  getRoomSettings,
  patchRoomSettings,
  roomSettingsFormSchema,
  type ModelNameChoices,
  type RoomSettingsFormInputType,
} from '@/features/api/vrmchat/room_settings';
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
import { cn } from '@/app/components/lib/shadcn';
import { Button } from '@/app/components/ui/shadcn/button';
import { Alert, AlertDescription } from '@/app/components/ui/shadcn/alert';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/app/components/ui/shadcn/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/shadcn/popover"
import { Slider } from '@/app/components/ui/shadcn/slider';
import { Textarea } from '@/app/components/ui/shadcn/textarea';
// icons
import { Loader2, Check, ChevronsUpDown } from 'lucide-react';
// components
import { showToast, OverlaySpinner } from '@/app/components/utils';
// import
import { VrmChatRoomParams } from '../../page';


// type
type RoomSettingsFormProps = Pick<VrmChatRoomParams, 'roomId'> & {
  setSheetOpen: Dispatch<SetStateAction<boolean>>;
};

// RoomSettingsForm ▽
export function RoomSettingsForm({ roomId, setSheetOpen }: RoomSettingsFormProps): ReactElement {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [errorMsg, setErrorMsg]   = useState<string>('');
  const [modelNameChoices, setModelNameChoices] = useState<ModelNameChoices[]>([]);

  // ++++++++++
  // form
  // - useForm
  const form = useForm<RoomSettingsFormInputType>({
    resolver: zodResolver(roomSettingsFormSchema),
    defaultValues: {
      model_name:         0,
      system_sentence:    '',
      assistant_sentence: '',
      history_len:        0,
      max_tokens:         0,
      temperature:        0,
      top_p:              0,
      presence_penalty:   0,
      frequency_penalty:  0,
      comment:            '',
    },
  });
  // - form data
  useEffect(() => {(async () => {
    setIsLoading(true);
    try {
      const result = await getRoomSettings({roomId: roomId})
      if (result.ok) {
        const item = result.data;
        // data -> form value
        if (item) {
          setModelNameChoices(item.modelNameChoices);
          form.reset({
            model_name:         item.modelName,
            system_sentence:    item.systemSentence ?? '',
            assistant_sentence: item.assistantSentence ?? '',
            history_len:        item.historyLen,
            max_tokens:         item.maxTokens,
            temperature:        item.temperature,
            top_p:              item.topP,
            presence_penalty:   item.presencePenalty,
            frequency_penalty:  item.frequencyPenalty,
            comment:            item.comment ?? '',
          });
        } else {
          showToast('error', 'Failed get form data.');
        };
      };
    } catch {
      showToast('error', 'Failed get form data.');
    } finally {
      setIsLoading(false);
    };
  })(); }, [form, roomId]);
  // - useCommonSubmit
  const handleSubmit = useCommonSubmit<RoomSettingsFormInputType>({
    isSending,
    setIsSending,
    setErrorMsg,
    submitFunction: async (data) => {
      return await patchRoomSettings({
        roomId:   roomId,
        formData: data,
      });
    },
    onSuccess: () => {
      setSheetOpen(false);
    },
    defaultExceptionToastMessage: 'Update failed',
    defaultErrorMessage:          'Update failed',
  });
  // ++++++++++

  return (
    <>
      {/* OverlaySpinner */}
      <OverlaySpinner isActivate={isLoading || isSending} />
      {/* Alert */}
      {errorMsg && (
        <Alert variant   = 'destructive'
               className = 'mb-4'>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}
      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          {/* model_name (Select) */}
          <FormField control = {form.control}
                     name    = 'model_name'
                     render  = {({ field }) => (
            <FormItem className='mb-4'>
              <FormLabel htmlFor='model_name'>model_name</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant   = 'outline'
                            role      = 'combobox'
                            id        = 'model_name'
                            className = {cn(
                              'w-full justify-between',
                              !field.value && 'text-muted-foreground',)}>
                        {field.value
                          ? modelNameChoices.find(
                              (choice) => choice.value === field.value
                            )?.label : 'Select'}
                        <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
                      </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className = 'p-0'
                                onWheel   = {(e) => {e.stopPropagation();}} >
                  <Command>
                    <CommandInput placeholder='Search...' />
                    <CommandList>
                      <CommandEmpty>Not found.</CommandEmpty>
                      <CommandGroup>
                        {modelNameChoices?.map((choice) => (
                          <CommandItem key      = {choice.value}
                                       value    = {String(choice.value)}
                                       onSelect = {() => {form.setValue('model_name', Number(choice.value))}}>
                            {choice.label}
                            <Check className={cn(
                              'ml-auto',
                              choice.value === field.value ? 'opacity-100' : 'opacity-0',)}/>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )} />

          {/* system_sentence (Textarea) */}
          <FormField control = {form.control}
                     name    = 'system_sentence'
                     render  = {({ field }) => (
            <FormItem className='mb-4'>
              <FormLabel htmlFor='system_sentence'>system_sentence</FormLabel>
              <FormControl>
                <Textarea {...field}
                          id          = 'system_sentence'
                          className   = 'resize-y'
                          placeholder = 'Enter system statement' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* assistant_sentence (Textarea) */}
          <FormField control = {form.control}
                     name    = 'assistant_sentence'
                     render  = {({ field }) => (
            <FormItem className='mb-4'>
              <FormLabel htmlFor='assistant_sentence'>assistant_sentence</FormLabel>
              <FormControl>
                <Textarea {...field}
                          id          = 'assistant_sentence'
                          className   = 'resize-y'
                          placeholder = 'Enter assistant sentence' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* history_len (Slider) */}
          <FormField control = {form.control}
                     name    = 'history_len'
                     render  = {({ field }) => (
            <FormItem className='mb-4'>
              <FormLabel htmlFor='history_len'>history_len: {field.value}</FormLabel>
              <FormControl>
                <Slider value = {[field.value]}
                        id    = 'history_len'
                        min   = {0}
                        max   = {30}
                        step  = {1}
                        onValueChange = {(val) => field.onChange(val[0])}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* max_tokens (Slider) */}
          <FormField control = {form.control}
                     name    = 'max_tokens'
                     render  = {({ field }) => (
            <FormItem className='mb-4'>
              <FormLabel htmlFor='max_tokens'>max_tokens: {field.value}</FormLabel>
              <FormControl>
                <Slider value = {[field.value]}
                        id    = 'max_tokens'
                        min   = {50}
                        max   = {8192}
                        step  = {1}
                        onValueChange = {(val) => field.onChange(val[0])}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* temperature (Slider) */}
          <FormField control = {form.control}
                     name    = 'temperature'
                     render  = {({ field }) => (
            <FormItem className='mb-4'>
              <FormLabel htmlFor='temperature'>temperature: {field.value}</FormLabel>
              <FormControl>
                <Slider value = {[field.value]}
                        id    = 'temperature'
                        min   = {0}
                        max   = {2}
                        step  = {0.01}
                        onValueChange = {(val) => field.onChange(val[0])}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* top_p (Slider) */}
          <FormField control = {form.control}
                     name    = 'top_p'
                     render  = {({ field }) => (
            <FormItem className='mb-4'>
              <FormLabel htmlFor='top_p'>top_p: {field.value}</FormLabel>
              <FormControl>
                <Slider value = {[field.value]}
                        id    = 'top_p'
                        min   = {0}
                        max   = {1}
                        step  = {0.01}
                        onValueChange = {(val) => field.onChange(val[0])}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* presence_penalty (Slider) */}
          <FormField control = {form.control}
                     name    = 'presence_penalty'
                     render  = {({ field }) => (
            <FormItem className='mb-4'>
              <FormLabel htmlFor='presence_penalty'>presence_penalty: {field.value}</FormLabel>
              <FormControl>
                <Slider value = {[field.value]}
                        id    = 'presence_penalty'
                        min   = {-2}
                        max   = {2}
                        step  = {0.01}
                        onValueChange = {(val) => field.onChange(val[0])}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* frequency_penalty (Slider) */}
          <FormField control = {form.control}
                     name    = 'frequency_penalty'
                     render  = {({ field }) => (
            <FormItem className='mb-4'>
              <FormLabel htmlFor='frequency_penalty'>frequency_penalty: {field.value}</FormLabel>
              <FormControl>
                <Slider value = {[field.value]}
                        id    = 'frequency_penalty'
                        min   = {-2}
                        max   = {2}
                        step  = {0.01}
                        onValueChange = {(val) => field.onChange(val[0])}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* comment (Textarea) */}
          <FormField control = {form.control}
                     name    = 'comment'
                     render  = {({ field }) => (
            <FormItem className='mb-4'>
              <FormLabel htmlFor='comment'>comment</FormLabel>
              <FormControl>
                <Textarea {...field}
                          id          = 'comment'
                          className   = 'resize-y'
                          placeholder = 'memo/comment' />
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
// RoomSettingsForm △