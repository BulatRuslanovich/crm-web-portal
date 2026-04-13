import type { Metadata } from 'next';
import ActivEditPage from './ActivEditClient';

export const metadata: Metadata = {
  title: 'Редактирование активности',
  robots: { index: false, follow: false },
};

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ActivEditPage params={params} />;
}
