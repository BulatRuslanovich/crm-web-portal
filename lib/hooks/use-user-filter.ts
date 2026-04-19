'use client';

import { useCallback, useEffect, useState } from 'react';

const KEY = 'crm:userFilter';
const EVENT = 'crm:userFilter:change';

function readStored(): string {
  if (typeof window === 'undefined') return '';
  try {
    return sessionStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
}

export function useUserFilter(): [string, (v: string) => void] {
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    setValue(readStored());
    const onChange = (e: Event) => {
      const ce = e as CustomEvent<string>;
      setValue(ce.detail ?? '');
    };
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);

  const update = useCallback((v: string) => {
    try {
      if (v) sessionStorage.setItem(KEY, v);
      else sessionStorage.removeItem(KEY);
    } catch {
      // ignore
    }
    setValue(v);
    window.dispatchEvent(new CustomEvent(EVENT, { detail: v }));
  }, []);

  return [value, update];
}
