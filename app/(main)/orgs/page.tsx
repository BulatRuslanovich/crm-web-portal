import type { Metadata } from 'next';
import OrgsPage from './OrgsClient';

export const metadata: Metadata = {
  title: 'Организации',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <OrgsPage />;
}
