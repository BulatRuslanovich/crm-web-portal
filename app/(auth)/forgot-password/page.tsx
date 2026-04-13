import type { Metadata } from 'next';
import ForgotPasswordForm from './ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Восстановление пароля',
  description: 'Восстановите доступ к аккаунту Pharmo CRM.',
  robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
