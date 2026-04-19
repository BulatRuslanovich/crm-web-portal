import type { Metadata } from 'next';
import PharmoPage from './PharmoPage';

export const metadata: Metadata = {
  title: 'Pharmo CRM · Credits',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <PharmoPage />;
}
