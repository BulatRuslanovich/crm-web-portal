import type { Metadata } from 'next';
import EditActivPage from './EditActivPage';

export const metadata: Metadata = {
  title: 'Редактирование активности',
  robots: { index: false, follow: false },
};

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <EditActivPage params={params} />;
}
