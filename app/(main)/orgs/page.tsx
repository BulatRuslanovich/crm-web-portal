import type { Metadata } from 'next';
import OrgsPage from './OrgsPage';

export const metadata: Metadata = {
  title: 'Организации',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <OrgsPage />;
}
