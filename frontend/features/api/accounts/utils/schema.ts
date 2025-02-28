import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(12, { message: 'Must be at least 12 characters' })
  .refine((val) => !/^\d+$/.test(val), {
    message: 'Please include alphabetic characters in your password',
  })
  .refine((val) => /[a-zA-Z]/.test(val), {
    message: 'Please include alphabetic characters in your password',
  })
  .refine((val) => /\d/.test(val), {
    message: 'Please include numbers in your password',
  })

export const emailSchema = z
  .string()
  .email({ message: 'Please enter your email address' })
  .max(254, { message: 'This email address cannot be registered' })