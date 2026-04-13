import type { Metadata } from 'next';
import AdminPage from './AdminClient';

export const metadata: Metadata = {
  title: 'Администрирование',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminPage />;
}
