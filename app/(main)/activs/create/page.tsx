import type { Metadata } from 'next';
import CreateActivPage from './CreateActivClient';

export const metadata: Metadata = {
  title: 'Новая активность',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CreateActivPage />;
}
