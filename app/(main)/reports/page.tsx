import type { Metadata } from 'next';
import ReportsPage from './ReportsPage';

export const metadata: Metadata = {
  title: 'Отчёты',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ReportsPage />;
}
