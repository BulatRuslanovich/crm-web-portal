import type { Metadata } from 'next';
import ActivsPage from './ActivsPage';

export const metadata: Metadata = {
  title: 'Активности',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ActivsPage />;
}
