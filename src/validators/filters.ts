import { Priority, TaskStatus } from '@prisma/client';
import { z } from 'zod';

export const taskFiltersSchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
}).refine((filters) => !filters.from || !filters.to || filters.from <= filters.to, { message: 'from must be before to', path: ['to'] });
export type TaskFilters = z.infer<typeof taskFiltersSchema>;
