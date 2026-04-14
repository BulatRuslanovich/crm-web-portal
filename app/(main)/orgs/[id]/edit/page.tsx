import type { Metadata } from 'next';
import OrgEditPage from './OrgEditPage';

export const metadata: Metadata = {
  title: 'Редактирование организации',
  robots: { index: false, follow: false },
};

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <OrgEditPage params={params} />;
}
