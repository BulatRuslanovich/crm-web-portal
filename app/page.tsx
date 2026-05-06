import { redirect } from 'next/navigation';
import { refreshServerAccessToken } from '@/lib/api/server-client';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  let isAuthenticated;

  try {
    await refreshServerAccessToken();
    isAuthenticated = true;
  } catch {
    isAuthenticated = false;
  }

  redirect(isAuthenticated ? '/dashboard' : '/login');
}
