'use client';

import { useAuth } from '../auth-context';

export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return user?.policies?.includes('Admin') ?? false;
}
