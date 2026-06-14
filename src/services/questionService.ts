import { apiClient } from './apiClient';
import {
  BulkCreateQuestionsRequest,
  BulkCreateQuestionsResponse,
  Question,
  ApiResponse,
} from '../types';

export const questionService = {
  bulkCreate: (data: BulkCreateQuestionsRequest) =>
    apiClient.post<BulkCreateQuestionsResponse>('/questions/bulk', data),
  fetchBulk: (questionIds: string[]) =>
    apiClient.post<ApiResponse<Question[]>>('/questions/fetchBulk', {
      question_ids: questionIds,
    }),
};
