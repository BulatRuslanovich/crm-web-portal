import type { Metadata } from 'next';
import VerifyEmailForm from './VerifyEmailForm';

export const metadata: Metadata = {
  title: 'Подтверждение email',
  description: 'Подтвердите email для завершения регистрации в Pharmo CRM.',
  robots: { index: false, follow: true },
};

export default function VerifyEmailPage() {
  return <VerifyEmailForm />;
}
