import type { Metadata } from 'next';
import PhysViewPage from './PhysViewClient';

export const metadata: Metadata = {
  title: 'Просмотр физического лица',
  robots: { index: false, follow: false },
};

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <PhysViewPage params={params} />;
}
