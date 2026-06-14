export type TestType = 'chapterwise' | 'pyq' | 'mock';
export type TestStatus = 'draft' | 'live' | 'scheduled' | 'unpublished' | 'expired' | null;
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Test {
  id: string;
  name: string;
  type: TestType;
  subject: string;
  subject_id?: string;
  topics: string[];
  topic_ids?: string[];
  sub_topics?: string[];
  sub_topic_ids?: string[];
  difficulty: Difficulty;
  correct_marks: number;
  wrong_marks: number;
  unattempt_marks: number;
  total_time: number;
  total_marks: number;
  total_questions: number;
  questions?: string[];
  status: TestStatus;
  created_at: string;
  updated_at?: string;
}

export interface CreateTestRequest {
  name: string;
  type: TestType;
  subject: string;
  topics: string[];
  sub_topics: string[];
  correct_marks: number;
  wrong_marks: number;
  unattempt_marks: number;
  difficulty: Difficulty;
  total_time: number;
  total_marks: number;
  total_questions: number;
  status: TestStatus;
}

export interface UpdateTestRequest {
  name?: string;
  type?: TestType;
  subject?: string;
  topics?: string[];
  sub_topics?: string[];
  correct_marks?: number;
  wrong_marks?: number;
  unattempt_marks?: number;
  difficulty?: Difficulty;
  total_time?: number;
  total_marks?: number;
  total_questions?: number;
  questions?: string[];
  status?: TestStatus;
}

export interface TestFormValues {
  name: string;
  type: TestType;
  subject: string;
  topics: string[];
  sub_topics: string[];
  difficulty: Difficulty;
  correct_marks: number;
  wrong_marks: number;
  unattempt_marks: number;
  total_time: number;
  total_marks: number;
  total_questions: number;
}

export type DurationOption = 'always' | '1_week' | '2_weeks' | '3_weeks' | '1_month' | 'custom';

export interface PublishOptions {
  mode: 'now' | 'schedule';
  duration: DurationOption;
  customEndDate?: string;
  customEndTime?: string;
  scheduledDate?: string;
  scheduledTime?: string;
}
