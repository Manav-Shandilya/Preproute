import { Difficulty } from './test.types';

export type CorrectOption = 'option1' | 'option2' | 'option3' | 'option4';

export interface Question {
  id: string;
  type: 'mcq';
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: CorrectOption;
  explanation?: string;
  difficulty?: Difficulty;
  topic_id?: string;
  sub_topic_id?: string;
  media_url?: string;
  test_id: string;
}

export interface CreateQuestionRequest {
  type: 'mcq';
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: CorrectOption;
  explanation?: string;
  difficulty?: Difficulty;
  media_url?: string;
  test_id: string;
  subject?: string;
}

export interface BulkCreateQuestionsRequest {
  questions: CreateQuestionRequest[];
}

export interface BulkCreateQuestionsResponse {
  success: boolean;
  data: Question[];
  message: string;
}

export interface QuestionFormValues {
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: CorrectOption;
  explanation?: string;
  difficulty?: Difficulty;
  topic_id?: string;
  sub_topic_id?: string;
  media_url?: string;
}

export interface QuestionSummary {
  index: number;
  isComplete: boolean;
}
