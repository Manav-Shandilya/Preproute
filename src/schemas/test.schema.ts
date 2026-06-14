import { z } from 'zod';

export const testFormSchema = z.object({
  name: z.string().min(1, 'Test name is required').max(200, 'Test name too long'),
  type: z.enum(['chapterwise', 'pyq', 'mock']),
  subject: z.string().min(1, 'Subject is required'),
  topics: z.array(z.string()).min(1, 'At least one topic is required'),
  sub_topics: z.array(z.string()),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  correct_marks: z.number().min(0, 'Must be 0 or greater'),
  wrong_marks: z.number().max(0, 'Must be 0 or negative'),
  unattempt_marks: z.number(),
  total_time: z.number().min(1, 'Duration must be at least 1 minute'),
  total_marks: z.number().min(1, 'Total marks must be at least 1'),
  total_questions: z.number().min(1, 'Must have at least 1 question'),
});

export type TestFormSchemaValues = z.infer<typeof testFormSchema>;
