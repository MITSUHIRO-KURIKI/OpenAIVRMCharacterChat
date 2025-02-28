import { z } from 'zod';


export const userProfileFormSchema = z.object({
  display_name: z.string().superRefine((val, ctx) => {
    const min = 1;
    const max = 25;
    if (val.length < min) {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        message: 'Please enter your username',
      });
    };
    if (val.length > max) {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        message: `Please enter within ${max} characters ( ${val.length} characters)`,
      });
    };
  }),
  user_icon: z.any().nullable(), 
});

export type UserProfileFormInputType = z.infer<typeof userProfileFormSchema>;