'use client';

import { useCallback, useState } from 'react';
import { extractApiError } from '@/lib/api/errors';

interface SubmitActionOptions {
  fallbackError?: string;
}

export function useSubmitAction({ fallbackError }: SubmitActionOptions = {}) {
  const [error, setError] = useState('');

  const submit = useCallback(
    async (action: () => Promise<void>) => {
      setError('');
      try {
        await action();
      } catch (err) {
        setError(extractApiError(err, fallbackError));
      }
    },
    [fallbackError],
  );

  return {
    error,
    setError,
    submit,
  } as const;
}
