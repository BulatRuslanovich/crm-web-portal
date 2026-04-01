'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AxiosError } from 'axios';
import { Card, Input, Label, ErrorBox, BtnSuccess } from '@/components/ui';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-(--fg) mb-5">Вход</h2>
        <form
          action={async (formData: FormData) => {
            setError('');
            setLoading(true);
            try {
              await login(
                formData.get('login') as string,
                formData.get('password') as string,
              );
              router.push('/dashboard');
            } catch (err) {
              const axiosErr = err as AxiosError<{ message?: string }>;
              setError(axiosErr.response?.data?.message ?? 'Неверный логин или пароль');
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-3"
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
            {loading ? 'Вход...' : 'Войти'}
          </BtnSuccess>
        </form>
        <div className="mt-4 pt-4 border-t border-(--border) flex flex-col gap-1.5 text-sm text-center">
          <Link href="/forgot-password" className="text-(--primary-text) hover:underline">Забыли пароль?</Link>
          <span className="text-(--fg-muted)">
            Нет аккаунта?{' '}
            <Link href="/register" className="text-(--primary-text) hover:underline">Зарегистрироваться</Link>
          </span>
        </div>
      </div>
    </Card>
  );
}
