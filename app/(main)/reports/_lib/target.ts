import type { ActivResponse } from '@/lib/api/types';

export type TargetKind = 'phys' | 'org' | 'none';

export function targetKind(a: ActivResponse): TargetKind {
  if (a.physId != null) return 'phys';
  if (a.orgId != null) return 'org';
  return 'none';
}

export function targetLabel(a: ActivResponse): string {
  return a.physName ?? a.orgName ?? '';
}

export function targetKindLabel(kind: TargetKind): string {
  if (kind === 'phys') return 'Врач';
  if (kind === 'org') return 'Организация';
  return '';
}
