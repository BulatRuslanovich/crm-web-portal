import { apiClient } from './client';
import type { DepartmentResponse, CreateDepartmentRequest, PagedResponse } from './types';

export const departmentsApi = {
  getAll: (page = 1, pageSize = 50) =>
    apiClient.get<PagedResponse<DepartmentResponse>>('/api/departments', {
      params: { page, pageSize },
    }),

  getById: (id: number) => apiClient.get<DepartmentResponse>(`/api/departments/${id}`),

  create: (data: CreateDepartmentRequest) =>
    apiClient.post<DepartmentResponse>('/api/departments', data),

  delete: (id: number) => apiClient.delete(`/api/departments/${id}`),

  addUser: (departmentId: number, usrId: number) =>
    apiClient.post(`/api/departments/${departmentId}/users/${usrId}`),

  removeUser: (departmentId: number, usrId: number) =>
    apiClient.delete(`/api/departments/${departmentId}/users/${usrId}`),
};
