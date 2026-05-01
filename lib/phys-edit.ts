'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/lib/hooks/use-api';
import { physesApi } from '@/lib/api/physes';
import { useMultiPicker } from '@/lib/hooks/use-multi-picker';
import type { PhysResponse } from '@/lib/api/types';
import { physFormToUpdateRequest, type PhysFormValues } from './phys-form';

export function useLoadedPhys(numId: number): PhysResponse | undefined {
  const router = useRouter();
  const { data, error } = useApi(['phys', numId], () =>
    physesApi.getById(numId).then((r) => r.data),
  );

  useEffect(() => {
    if (error) router.push('/physes');
  }, [error, router]);

  return data;
}

export function usePhysOrgPicker(phys: PhysResponse | undefined) {
  return useMultiPicker(
    useMemo(
      () =>
        phys
          ? phys.orgs.map((o) => ({
              id: o.orgId,
              option: { value: String(o.orgId), label: o.orgName },
            }))
          : [],
      [phys],
    ),
  );
}

export async function updatePhys(numId: number, values: PhysFormValues) {
  await physesApi.update(numId, physFormToUpdateRequest(values));
}

export async function syncOrgs(
  numId: number,
  diff: { toAdd: number[]; toRemove: number[] },
) {
  await Promise.all([
    ...diff.toAdd.map((oid) => physesApi.linkOrg(numId, oid)),
    ...diff.toRemove.map((oid) => physesApi.unlinkOrg(numId, oid)),
  ]);
}
