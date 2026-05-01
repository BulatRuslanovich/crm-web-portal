import type { Metadata } from 'next';
import MapTrackPage from './MapTrackPage';

export const metadata: Metadata = {
  title: 'Трекинг визитов',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <MapTrackPage />;
}
