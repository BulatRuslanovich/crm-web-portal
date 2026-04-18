'use client';

import { useApi } from '@/lib/use-api';
import { usersApi } from '@/lib/api/users';
import type { UserResponse } from '@/lib/api/types';

export function usePickerUsers(enabled: boolean) {
  const { data, loading } = useApi(
    enabled ? ['picker-users'] : null,
    () => usersApi.getAll(1, 1000).then((r) => r.data.items),
  );
  return { users: (data ?? []) as UserResponse[], loading };
}
