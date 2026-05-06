import { apiClient } from './browser-client';
import type {
  AuditAction,
  AuditEntityType,
  AuditLogPagedResponse,
  AuditLogResponse,
} from './types';

export interface AuditLogQuery {
  entityType?: AuditEntityType | string;
  entityId?: number;
  action?: AuditAction;
  changedBy?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  includeTotal?: boolean;
}

export const auditLogsApi = {
  search: (q: AuditLogQuery = {}) =>
    apiClient.get<AuditLogPagedResponse>('/api/audit-logs', { params: q }),

  forEntity: async (entityType: AuditEntityType, entityId: number): Promise<AuditLogResponse[]> => {
    const { data } = await apiClient.get<AuditLogResponse[] | AuditLogPagedResponse>(
      `/api/audit-logs/entity/${entityType}/${entityId}`,
    );
    if (Array.isArray(data)) return data;
    return data.items ?? [];
  },
};
