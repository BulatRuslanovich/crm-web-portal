import type { Metadata } from 'next';
import PhysesPage from './PhysesPage';

export const metadata: Metadata = {
  title: 'Физические лица',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <PhysesPage />;
}
