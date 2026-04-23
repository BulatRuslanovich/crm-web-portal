import type { Metadata } from 'next';
import ActivViewPage from './DetailActivPage';

export const metadata: Metadata = {
  title: 'Просмотр активности',
  robots: { index: false, follow: false },
};

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ActivViewPage params={params} />;
}
