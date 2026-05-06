import { apiClient } from './browser-client';
import type {
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  PolicyResponse,
  PagedResponse,
} from './types';

export const usersApi = {
  getMe: () => apiClient.get<UserResponse>('/api/users/me'),

  getAll: (page = 1, pageSize = 20) =>
    apiClient.get<PagedResponse<UserResponse>>('/api/users', { params: { page, pageSize } }),

  getById: (id: number) => apiClient.get<UserResponse>(`/api/users/${id}`),

  create: (data: CreateUserRequest) => apiClient.post<UserResponse>('/api/users', data),

  update: (id: number, data: UpdateUserRequest) =>
    apiClient.put<UserResponse>(`/api/users/${id}`, data),

  delete: (id: number) => apiClient.delete(`/api/users/${id}`),

  changePassword: (id: number, data: ChangePasswordRequest) =>
    apiClient.patch(`/api/users/${id}/password`, data),

  linkPolicy: (userId: number, policyId: number) =>
    apiClient.post(`/api/users/${userId}/policies/${policyId}`),

  unlinkPolicy: (userId: number, policyId: number) =>
    apiClient.delete(`/api/users/${userId}/policies/${policyId}`),

  getPolicies: () => apiClient.get<PolicyResponse[]>('/api/users/policies'),
};
