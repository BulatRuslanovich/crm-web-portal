'use client';

import { useAuth } from './auth-context';

export type Role = 'Admin' | 'Director' | 'Manager' | 'Representative';

export function useRoles() {
  const { user } = useAuth();
  const policies = user?.policies ?? [];

  const isAdmin = policies.includes('Admin');
  const isDirector = policies.includes('Director');
  const isManager = policies.includes('Manager');
  const isRepresentative = policies.includes('Representative');

  return {
    policies,
    isAdmin,
    isDirector,
    isManager,
    isRepresentative,
    canManageActivs: isAdmin || isDirector || isManager,
    canSeeAllActivs: isAdmin || isDirector,
  };
}
