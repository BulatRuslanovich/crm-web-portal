import type { ActivResponse, CreateActivRequest, UpdateActivRequest } from '@/lib/api/types';
import { STATUS_PLANNED } from '@/lib/api/statuses';
import type { TargetKind } from '@/components/TargetSwitcher';

export interface CreateActivFormValues {
  orgId: string;
  physId: string;
  start: string;
  description: string;
}

export const CREATE_ACTIV_DEFAULT_VALUES: CreateActivFormValues = {
  orgId: '',
  physId: '',
  start: '',
  description: '',
};

export interface EditActivFormValues {
  statusId: string;
  start: string;
  end: string;
  description: string;
}

export const EDIT_ACTIV_DEFAULT_VALUES: EditActivFormValues = {
  statusId: '1',
  start: '',
  end: '',
  description: '',
};

export interface TargetIds {
  orgId: number | null;
  physId: number | null;
  error?: string;
}

export function buildTargetIds(values: CreateActivFormValues, kind: TargetKind): TargetIds {
  const orgId = kind === 'org' && values.orgId ? Number(values.orgId) : null;
  const physId = kind === 'phys' && values.physId ? Number(values.physId) : null;

  if ((orgId == null) === (physId == null)) {
    return {
      orgId,
      physId,
      error: kind === 'org' ? 'Выберите организацию' : 'Выберите врача',
    };
  }
  return { orgId, physId };
}

export function activFormToCreateRequest(
  values: CreateActivFormValues,
  targetIds: TargetIds,
): CreateActivRequest {
  return {
    orgId: targetIds.orgId,
    physId: targetIds.physId,
    statusId: STATUS_PLANNED,
    start: values.start,
    end: null,
    description: values.description,
  };
}

export function activToFormValues(activ: ActivResponse): EditActivFormValues {
  return {
    statusId: String(activ.statusId),
    start: activ.start ? activ.start.slice(0, 16) : '',
    end: activ.end ? activ.end.slice(0, 16) : '',
    description: activ.description ?? '',
  };
}

export function activFormToUpdateRequest(
  activ: ActivResponse,
  values: EditActivFormValues,
  canEditFields: boolean,
): UpdateActivRequest {
  return {
    statusId: canEditFields ? Number(values.statusId) : activ.statusId,
    start: canEditFields ? values.start || null : activ.start,
    end: canEditFields ? values.end || null : activ.end,
    description: values.description || null,
  };
}
