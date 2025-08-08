import { z } from 'zod';
import { registerSchema, loginSchema } from '@/utils/schemas/auth-schema';

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export interface ActionState {
    success: boolean;
    error?: string;
    fieldErrors: Record<string, string>;
    email?: string;
    password?: string;
}
