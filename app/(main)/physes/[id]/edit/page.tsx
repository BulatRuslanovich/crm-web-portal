import type { Metadata } from 'next';
import PhysEditPage from './PhysEditClient';

export const metadata: Metadata = {
  title: 'Редактирование физического лица',
  robots: { index: false, follow: false },
};

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <PhysEditPage params={params} />;
}
