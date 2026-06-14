import { apiClient } from './apiClient';
import { Subject, Topic, SubTopic, ApiResponse } from '../types';

export const subjectService = {
  getAll: () => apiClient.get<ApiResponse<Subject[]>>('/subjects'),
  getTopicsBySubject: (subjectId: string) =>
    apiClient.get<ApiResponse<Topic[]>>(`/topics/subject/${subjectId}`),
  getSubTopicsByTopics: (topicIds: string[]) =>
    apiClient.post<ApiResponse<SubTopic[]>>('/sub-topics/multi-topics', {
      topicIds,
    }),
};
