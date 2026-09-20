import { Role } from '@prisma/client';
import { z } from 'zod';

export const clientSchema = z.object({ name: z.string().min(2).max(120), email: z.string().email(), company: z.string().min(2).max(160) });
export const clientUpdateSchema = clientSchema.partial();
export const userSchema = z.object({ name: z.string().min(2).max(120), email: z.string().email(), password: z.string().min(8), role: z.nativeEnum(Role) });
export const userUpdateSchema = userSchema.omit({ password: true }).partial().extend({ password: z.string().min(8).optional() });
