import type {
  CreateOrgRequest,
  OrgResponse,
  UpdateOrgRequest,
} from '@/lib/api/types';

export interface OrgFormValues {
  orgTypeId: string;
  orgName: string;
  inn: string;
  address: string;
  latitude: string;
  longitude: string;
}

export const ORG_DEFAULT_VALUES: OrgFormValues = {
  orgTypeId: '',
  orgName: '',
  inn: '',
  address: '',
  latitude: '',
  longitude: '',
};

export function orgToFormValues(org: OrgResponse): OrgFormValues {
  return {
    orgTypeId: String(org.orgTypeId),
    orgName: org.orgName,
    inn: org.inn ?? '',
    address: org.address ?? '',
    latitude: org.latitude != null ? String(org.latitude) : '',
    longitude: org.longitude != null ? String(org.longitude) : '',
  };
}

export function orgFormToCreateRequest(values: OrgFormValues): CreateOrgRequest {
  return {
    orgTypeId: Number(values.orgTypeId),
    orgName: values.orgName,
    inn: values.inn || '',
    address: values.address || '',
    latitude: values.latitude ? Number(values.latitude) : 0,
    longitude: values.longitude ? Number(values.longitude) : 0,
  };
}

export function orgFormToUpdateRequest(values: OrgFormValues): UpdateOrgRequest {
  return {
    orgTypeId: Number(values.orgTypeId),
    orgName: values.orgName,
    inn: values.inn || null,
    address: values.address || null,
    latitude: values.latitude ? Number(values.latitude) : null,
    longitude: values.longitude ? Number(values.longitude) : null,
  };
}
