import { apiClient } from './client';
import type { PhysResponse, CreatePhysRequest, UpdatePhysRequest, PagedResponse } from './types';

export const physesApi = {
  getAll: (page = 1, pageSize = 20, search?: string) =>
    apiClient.get<PagedResponse<PhysResponse>>('/api/physes', {
      params: { page, pageSize, search },
    }),

  getById: (id: number) => apiClient.get<PhysResponse>(`/api/physes/${id}`),

  create: (data: CreatePhysRequest) => apiClient.post<PhysResponse>('/api/physes', data),

  update: (id: number, data: UpdatePhysRequest) =>
    apiClient.put<PhysResponse>(`/api/physes/${id}`, data),

  delete: (id: number) => apiClient.delete(`/api/physes/${id}`),

  linkOrg: (physId: number, orgId: number) => apiClient.post(`/api/physes/${physId}/orgs/${orgId}`),

  unlinkOrg: (physId: number, orgId: number) =>
    apiClient.delete(`/api/physes/${physId}/orgs/${orgId}`),
};

function formatPhysLabel(p: PhysResponse): string {
  return [p.lastName, p.firstName, p.middleName].filter(Boolean).join(' ');
}

export async function searchPhysOptions(query: string) {
  const { data } = await physesApi.getAll(1, 20, query || undefined);
  return data.items.map((p) => ({
    value: String(p.physId),
    label: formatPhysLabel(p),
    sublabel: p.specName || undefined,
  }));
}
