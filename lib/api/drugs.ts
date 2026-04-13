import { apiClient } from './client';
import type { DrugResponse, CreateDrugRequest, UpdateDrugRequest, PagedResponse } from './types';

export const drugsApi = {
  getAll: (page = 1, pageSize = 20, search?: string) =>
    apiClient.get<PagedResponse<DrugResponse>>('/api/drugs', { params: { page, pageSize, search } }),

  getById: (id: number) => apiClient.get<DrugResponse>(`/api/drugs/${id}`),

  create: (data: CreateDrugRequest) => apiClient.post<DrugResponse>('/api/drugs', data),

  update: (id: number, data: UpdateDrugRequest) =>
    apiClient.put<DrugResponse>(`/api/drugs/${id}`, data),

  delete: (id: number) => apiClient.delete(`/api/drugs/${id}`),
};
