import { z } from 'zod';

export const publishSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('now'),
    duration: z.enum(['always', '1_week', '2_weeks', '3_weeks', '1_month', 'custom']),
    customEndDate: z.string().optional(),
    customEndTime: z.string().optional(),
  }),
  z.object({
    mode: z.literal('schedule'),
    duration: z.enum(['always', '1_week', '2_weeks', '3_weeks', '1_month', 'custom']),
    scheduledDate: z.string().min(1, 'Schedule date is required'),
    scheduledTime: z.string().min(1, 'Schedule time is required'),
    customEndDate: z.string().optional(),
    customEndTime: z.string().optional(),
  }),
]);

export type PublishFormValues = z.infer<typeof publishSchema>;
