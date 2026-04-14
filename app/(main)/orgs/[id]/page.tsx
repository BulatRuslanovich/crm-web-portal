import type { Metadata } from 'next';
import OrgViewPage from './OrgDetailPage';

export const metadata: Metadata = {
  title: 'Просмотр организации',
  robots: { index: false, follow: false },
};

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <OrgViewPage params={params} />;
}
