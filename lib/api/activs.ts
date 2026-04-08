import { apiClient } from './client';
import type { ActivResponse, CreateActivRequest, UpdateActivRequest, PagedResponse } from './types';

export const activsApi = {
  getAll: (
    page = 1,
    pageSize = 20,
    search?: string,
    sortBy?: string,
    sortDesc?: boolean,
    statusesFilter?: number[],
  ) =>
    apiClient.get<PagedResponse<ActivResponse>>('/api/activs', {
      params: { page, pageSize, search, sortBy, sortDesc, statuses: statusesFilter },
    }),

  getById: (id: number) => apiClient.get<ActivResponse>(`/api/activs/${id}`),

  create: (data: CreateActivRequest) => apiClient.post<ActivResponse>('/api/activs', data),

  update: (id: number, data: UpdateActivRequest) =>
    apiClient.put<ActivResponse>(`/api/activs/${id}`, data),

  delete: (id: number) => apiClient.delete(`/api/activs/${id}`),

  addDrug: (activId: number, drugId: number) =>
    apiClient.post(`/api/activs/${activId}/drugs/${drugId}`),

  removeDrug: (activId: number, drugId: number) =>
    apiClient.delete(`/api/activs/${activId}/drugs/${drugId}`),
};
