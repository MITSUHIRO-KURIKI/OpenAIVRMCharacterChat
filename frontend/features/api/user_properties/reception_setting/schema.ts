import { z } from 'zod';


export const userReceptionSettingFormSchema = z
  .object({
    is_receive_all:            z.boolean(),
    is_receive_important_only: z.boolean(),
  })
  .superRefine((data, ctx) => {
    // 「どちらか片方だけ true」(XOR) を満たさない場合
    if (data.is_receive_all === data.is_receive_important_only) {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        message: '',
        path:    ['is_receive_all'],
      });
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        message: 'いずれか一方を選択してください',
        path:    ['is_receive_important_only'],
      });
    };
  });

export type userReceptionSettingFormInputType = z.infer<typeof userReceptionSettingFormSchema>;