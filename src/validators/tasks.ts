import { z } from 'zod';

export const taskSchema = z.object({ projectId: z.number().int().positive(), title: z.string().min(2).max(160), description: z.string().max(3000).optional(), assignedDeveloperId: z.number().int().positive(), status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(), priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(), dueDate: z.coerce.date() });
export const taskUpdateSchema = taskSchema.omit({ projectId: true }).partial();
export const statusSchema = z.object({ status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']) });
