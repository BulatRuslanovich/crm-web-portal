import type { Metadata } from 'next';
import CreateOrgPage from './CreateOrgClient';

export const metadata: Metadata = {
  title: 'Новая организация',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CreateOrgPage />;
}
