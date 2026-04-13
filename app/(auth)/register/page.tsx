import type { Metadata } from 'next';
import RegisterForm from './RegisterForm';

export const metadata: Metadata = {
  title: 'Регистрация',
  description: 'Создайте аккаунт в Pharmo CRM для управления визитами к врачам и организациям.',
  openGraph: {
    title: 'Регистрация · Pharmo CRM',
    description: 'Зарегистрируйтесь в системе управления визитами.',
  },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
