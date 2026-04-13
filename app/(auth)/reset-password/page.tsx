import type { Metadata } from 'next';
import ResetPasswordForm from './ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Новый пароль',
  description: 'Установите новый пароль для аккаунта Pharmo CRM.',
  robots: { index: false, follow: true },
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
