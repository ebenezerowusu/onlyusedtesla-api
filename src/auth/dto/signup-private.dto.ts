import { z } from 'zod';
export const SignupPrivateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(3),
  zipCode: z.string().optional(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  acceptTos: z.boolean(),
}).refine(d => d.password === d.confirmPassword, { path: ['confirmPassword'], message: 'Passwords must match' })
 .refine(d => d.acceptTos === true, { path: ['acceptTos'], message: 'Terms must be accepted' });

export type SignupPrivateDto = z.infer<typeof SignupPrivateSchema>;
