import { apiClient } from './apiClient';
import { LoginRequest, LoginResponse, ApiResponse } from '../types';

export const authService = {
  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<LoginResponse['data']>>('/auth/login', data),
};
