import type { Metadata } from 'next';
import AuditLogPage from './AuditLogPage';

export const metadata: Metadata = {
  title: 'Аудит-лог',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AuditLogPage />;
}
