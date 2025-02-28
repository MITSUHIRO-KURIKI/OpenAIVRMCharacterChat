import { z } from 'zod';
import { emailSchema } from '../utils/schema';

export const passwordResetFormSchema = z.object({
  email: emailSchema,
});

export type PasswordResetFormInputType = z.infer<typeof passwordResetFormSchema>;