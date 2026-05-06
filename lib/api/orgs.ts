import { apiClient } from './browser-client';
import type {
  OrgResponse,
  OrgTypeResponse,
  CreateOrgRequest,
  UpdateOrgRequest,
  PagedResponse,
} from './types';

export const orgsApi = {
  getAll: (page = 1, pageSize = 20, search?: string) =>
    apiClient.get<PagedResponse<OrgResponse>>('/api/orgs', { params: { page, pageSize, search } }),

  getById: (id: number) => apiClient.get<OrgResponse>(`/api/orgs/${id}`),

  create: (data: CreateOrgRequest) => apiClient.post<OrgResponse>('/api/orgs', data),

  update: (id: number, data: UpdateOrgRequest) =>
    apiClient.put<OrgResponse>(`/api/orgs/${id}`, data),

  delete: (id: number) => apiClient.delete(`/api/orgs/${id}`),

  getTypes: () => apiClient.get<OrgTypeResponse[]>('/api/orgs/types'),
};

export async function searchOrgOptions(query: string) {
  const { data } = await orgsApi.getAll(1, 20, query || undefined);
  return data.items.map((o) => ({ value: String(o.orgId), label: o.orgName }));
}
