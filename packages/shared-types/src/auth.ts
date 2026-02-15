import { z } from 'zod';
import { UserSchema } from './user.js';

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(100),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const AuthResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    user: UserSchema,
  }),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
