import { z } from 'zod';


export const roomSettingsFormSchema = z.object({
  model_name:         z.coerce.number().min(1),
  system_sentence:    z.string().superRefine((val, ctx) => {
    const max = 1500;
    if (val.length > max) {
      ctx.addIssue({
        code:     z.ZodIssueCode.custom,
        message: `Please enter within ${max} characters ( ${val.length} characters)`,
      });
    };
  }),
  assistant_sentence: z.string().superRefine((val, ctx) => {
    const max = 1500;
    if (val.length > max) {
      ctx.addIssue({
        code:     z.ZodIssueCode.custom,
        message: `Please enter within ${max} characters ( ${val.length} characters)`,
      });
    };
  }),
  history_len:        z.coerce.number().min(0).max(30),
  max_tokens:         z.coerce.number().min(1).max(8192),
  temperature:        z.coerce.number().min(0).max(2),
  top_p:              z.coerce.number().min(0).max(1),
  presence_penalty:   z.coerce.number().min(-2).max(2),
  frequency_penalty:  z.coerce.number().min(-2).max(2),
  comment:            z.string().superRefine((val, ctx) => {
    const max = 256;
    if (val.length > max) {
      ctx.addIssue({
        code:     z.ZodIssueCode.custom,
        message: `Please enter within ${max} characters ( ${val.length} characters)`,
      });
    };
  }),
});

export const roomSettingsRoomNameChangeSchema = z.object({
  room_name: z.string().superRefine((val, ctx) => {
    const min = 1;
    const max = 50;
    if (val.length < min) {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        message: `Please enter room name`,
      });
    };
    if (val.length > max) {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        message: `Please enter within ${max} characters ( ${val.length} characters)`,
      });
    };
  }),
});

export type RoomSettingsFormInputType           = z.infer<typeof roomSettingsFormSchema>;
export type RoomSettingsRoomNameChangeInputType = z.infer<typeof roomSettingsRoomNameChangeSchema>;