'use client';

import useSWR, { type SWRConfiguration } from 'swr';

export function useApi<T>(
  key: string | unknown[] | null,
  fetcher: () => Promise<T>,
  options?: SWRConfiguration<T>,
) {
  const { data, error, isLoading, mutate } = useSWR<T>(
    key,
    () => fetcher(),
    { revalidateOnFocus: false, ...options },
  );

  return {
    data,
    loading: isLoading,
    error: !!error,
    reload: () => mutate(),
  } as const;
}
