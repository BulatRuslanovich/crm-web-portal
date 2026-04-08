'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { extractApiError } from '@/lib/api/errors';
import { Input, Label, ErrorBox, BtnSuccess } from '@/components/ui';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="p-6">
      <h2 className="mb-1 text-xl font-bold text-(--fg)">Вход</h2>
      <p className="mb-5 text-sm text-(--fg-muted)">Войдите в свой аккаунт для продолжения</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          setError('');
          setLoading(true);
          try {
            await login(formData.get('login') as string, formData.get('password') as string);
            router.push('/dashboard');
          } catch (err) {
            setError(extractApiError(err, 'Неизвестная ошибка при входе'));
          } finally {
            setLoading(false);
          }
        }}
        className="space-y-4"
      >
        <div>
          <Label>Логин</Label>
          <Input name="login" type="text" required placeholder="Введите логин" />
        </div>
        <div>
          <Label>Пароль</Label>
          <Input name="password" type="password" required placeholder="Введите пароль" />
        </div>
        {error && <ErrorBox message={error} />}
        <BtnSuccess type="submit" disabled={loading} className="w-full">
          <LogIn size={15} />
          {loading ? 'Вход...' : 'Войти'}
        </BtnSuccess>
      </form>
      <div className="mt-5 flex flex-col gap-2 border-t border-(--border) pt-5 text-center text-sm">
        <Link href="/forgot-password" className="text-(--primary-text) hover:underline">
          Забыли пароль?
        </Link>
        <span className="text-(--fg-muted)">
          Нет аккаунта?{' '}
          <Link href="/register" className="font-medium text-(--primary-text) hover:underline">
            Зарегистрироваться
          </Link>
        </span>
      </div>
    </div>
  );
}
