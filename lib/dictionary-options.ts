'use client';

import { orgsApi } from '@/lib/api/orgs';
import { specsApi } from '@/lib/api/specs';
import { useApi } from '@/lib/hooks/use-api';

export function useOrgTypeOptions() {
  const { data: types = [] } = useApi(
    'org-types',
    () => orgsApi.getTypes().then(({ data }) => data),
    { dedupingInterval: 300_000 },
  );
  return types.map((t) => ({ value: String(t.orgTypeId), label: t.orgTypeName }));
}

export function useSpecOptions() {
  const { data: specs = [] } = useApi('specs', () => specsApi.getAll().then(({ data }) => data), {
    dedupingInterval: 300_000,
  });
  return specs.map((s) => ({ value: String(s.specId), label: s.specName }));
}
