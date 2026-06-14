import { apiClient } from './apiClient';
import { Test, CreateTestRequest, UpdateTestRequest, ApiResponse } from '../types';

export const testService = {
  getAll: () => apiClient.get<ApiResponse<Test[]>>('/tests'),
  getById: (id: string) => apiClient.get<ApiResponse<Test>>(`/tests/${id}`),
  create: (data: CreateTestRequest) =>
    apiClient.post<ApiResponse<Test>>('/tests', data),
  update: (id: string, data: UpdateTestRequest) =>
    apiClient.put<ApiResponse<Test>>(`/tests/${id}`, data),
  delete: (id: string) => apiClient.delete<ApiResponse<void>>(`/tests/${id}`),
};
