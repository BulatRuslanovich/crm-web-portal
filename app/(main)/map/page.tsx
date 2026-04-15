import type { Metadata } from 'next';
import MapPage from './MapPage';

export const metadata: Metadata = {
  title: 'Карта',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <MapPage />;
}
