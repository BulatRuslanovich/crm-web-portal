import type { CreatePhysRequest, PhysResponse, UpdatePhysRequest } from '@/lib/api/types';

export interface PhysFormValues {
  specId: string;
  lastName: string;
  firstName: string;
  middleName: string;
  phone: string;
  email: string;
  position: string;
}

export const PHYS_DEFAULT_VALUES: PhysFormValues = {
  specId: '',
  lastName: '',
  firstName: '',
  middleName: '',
  phone: '',
  email: '',
  position: '',
};

export function physToFormValues(phys: PhysResponse): PhysFormValues {
  return {
    specId: phys.specId != null ? String(phys.specId) : '',
    lastName: phys.lastName,
    firstName: phys.firstName ?? '',
    middleName: phys.middleName ?? '',
    phone: phys.phone ?? '',
    email: phys.email ?? '',
    position: '',
  };
}

export function physFormToCreateRequest(values: PhysFormValues): CreatePhysRequest {
  return {
    specId: Number(values.specId),
    lastName: values.lastName,
    firstName: values.firstName,
    middleName: values.middleName,
    phone: values.phone,
    email: values.email,
  };
}

export function physFormToUpdateRequest(values: PhysFormValues): UpdatePhysRequest {
  return {
    specId: values.specId ? Number(values.specId) : null,
    lastName: values.lastName,
    firstName: values.firstName || null,
    middleName: values.middleName || null,
    phone: values.phone || null,
    email: values.email || null,
  };
}
