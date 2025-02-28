import { z } from 'zod';
import { emailSchema } from '@/features/api/accounts';


export const loginFormSchema = z.object({
  email:    emailSchema,
  password: z.string().min(1, { message: 'Please enter your password' }),
});

export type LoginFormInputType = z.infer<typeof loginFormSchema>;