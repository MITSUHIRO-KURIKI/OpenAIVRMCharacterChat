import { z } from 'zod';
import { passwordSchema, emailSchema } from '../utils/schema';


export const signupFormSchema = z 
  .object({
    email:       emailSchema,
    password:    passwordSchema,
    re_password: z.string().min(1,{ message: 'Please enter your password again to confirm.' }),
  })
  .refine(
    (data) => data.re_password === data.password, {
      message: 'Confirmation passwords do not match', path: ['re_password'],
  })

export type SignupFormInputType = z.infer<typeof signupFormSchema>;