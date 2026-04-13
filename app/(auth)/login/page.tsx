import type { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Вход',
  description: 'Войдите в Pharmo CRM — систему управления визитами медицинских представителей.',
  openGraph: {
    title: 'Вход · Pharmo CRM',
    description: 'Войдите в систему для планирования и проведения визитов.',
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
