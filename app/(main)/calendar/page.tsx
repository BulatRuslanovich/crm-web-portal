import type { Metadata } from 'next';
import CalendarPage from './CalendarPage';

export const metadata: Metadata = {
  title: 'Календарь',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CalendarPage />;
}
