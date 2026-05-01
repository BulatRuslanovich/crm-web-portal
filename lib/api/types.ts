export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ActivResponse {
  activId: number;
  usrId: number;
  usrLogin: string;
  orgId: number | null;
  orgName: string | null;
  physId: number | null;
  physName: string | null;
  statusId: number;
  statusName: string;
  start: string | null;
  end: string | null;
  description: string;
  latitude: number | null;
  longitude: number | null;
  drugs: DrugResponse[];
}

export interface CreateActivRequest {
  orgId: number | null;
  physId: number | null;
  statusId: number;
  start: string;
  end: string | null;
  description: string;
}

export interface UpdateActivRequest {
  statusId?: number | null;
  start?: string | null;
  end?: string | null;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface DrugResponse {
  drugId: number;
  drugName: string;
  brand: string;
  form: string;
}

export interface CreateDrugRequest {
  drugName: string;
  brand: string;
  form: string;
}

export interface UpdateDrugRequest {
  drugName: string | null;
  brand: string | null;
  form: string | null;
}

export interface OrgResponse {
  orgId: number;
  orgTypeId: number;
  orgTypeName: string;
  orgName: string;
  inn: string;
  latitude: number;
  longitude: number;
  address: string;
}

export interface CreateOrgRequest {
  orgTypeId: number;
  orgName: string;
  inn: string;
  latitude: number;
  longitude: number;
  address: string;
}

export interface UpdateOrgRequest {
  orgTypeId: number | null;
  orgName: string | null;
  inn: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
}

export interface CreatePhysRequest {
  specId: number;
  firstName: string;
  lastName: string;
  middleName: string | null;
  phone: string;
  email: string;
}

export interface UpdatePhysRequest {
  specId: number | null;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  phone: string | null;
  email: string | null;
}

export interface OrgTypeResponse {
  orgTypeId: number;
  orgTypeName: string;
}

export interface PhysResponse {
  physId: number;
  specId: number;
  specName: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  phone: string;
  email: string;
  orgs: OrgResponse[];
}

export interface SpecResponse {
  specId: number;
  specName: string;
}

export interface StatusResponse {
  statusId: number;
  statusName: string;
}

export interface UserResponse {
  usrId: number;
  firstName: string;
  lastName: string;
  email: string;
  login: string;
  policies: string[];
}

export interface PolicyResponse {
  policyId: number;
  policyName: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  login: string;
  password: string;
  policyIds: number[];
}

export interface UpdateUserRequest {
  firstName?: string | null;
  lastName?: string | null;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface DepartmentResponse {
  departmentId: number;
  departmentName: string;
  userCount: number;
}

export interface CreateDepartmentRequest {
  departmentName: string;
}

export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE';
export type AuditEntityType = 'activ' | 'org' | 'phys';

export interface AuditLogResponse {
  auditId: number;
  entityType: string;
  entityId: number;
  action: AuditAction;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
  changedBy: number | null;
  changedByLogin: string | null;
  changedAt: string;
}

export interface AuditLogPagedResponse {
  items: AuditLogResponse[];
  page: number;
  pageSize: number;
  total: number;
}
