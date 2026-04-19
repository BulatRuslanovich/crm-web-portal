'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/lib/hooks/use-api';
import { physesApi } from '@/lib/api/physes';
import { specsApi } from '@/lib/api/specs';
import { useMultiPicker } from '@/lib/hooks/use-multi-picker';
import type { PhysResponse } from '@/lib/api/types';

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

export function useSpecOptions() {
  const { data: specs = [] } = useApi(
    'specs',
    () => specsApi.getAll().then(({ data }) => data),
    { dedupingInterval: 300_000 },
  );
  return specs.map((s) => ({ value: String(s.specId), label: s.specName }));
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

export async function updatePhys(numId: number, values: PhysFormValues) {
  await physesApi.update(numId, {
    specId: values.specId ? Number(values.specId) : null,
    lastName: values.lastName,
    firstName: values.firstName || null,
    middleName: values.middleName || null,
    phone: values.phone || null,
    email: values.email || null,
  });
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
