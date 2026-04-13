import type { Metadata } from 'next';
import CreatePhysPage from './CreatePhysClient';

export const metadata: Metadata = {
  title: 'Новое физическое лицо',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CreatePhysPage />;
}
