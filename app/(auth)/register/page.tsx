'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AxiosError } from 'axios';
import { Card, Input, Label, ErrorBox, BtnSuccess } from '@/components/ui';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-(--fg) mb-5">Регистрация</h2>
        <form
          action={async (formData: FormData) => {
            setError('');
            setLoading(true);
            try {
              const { email } = await register({
                login: formData.get('login') as string,
                password: formData.get('password') as string,
                firstName: (formData.get('firstName') as string) || null,
                lastName: (formData.get('lastName') as string) || null,
                email: (formData.get('email') as string) || null,
                phone: (formData.get('phone') as string) || null,
              });
              router.push(`/verify-email?email=${encodeURIComponent(email)}`);
            } catch (err) {
              const axiosErr = err as AxiosError<{ message?: string }>;
              setError(axiosErr.response?.data?.message ?? 'Ошибка регистрации');
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Имя</Label>
              <Input name="firstName" type="text" placeholder="Иван" />
            </div>
            <div>
              <Label>Фамилия</Label>
              <Input name="lastName" type="text" placeholder="Иванов" />
            </div>
          </div>
          <div>
            <Label required>Логин</Label>
            <Input name="login" type="text" required placeholder="ivanov" />
          </div>
          <div>
            <Label>Email</Label>
            <Input name="email" type="email" placeholder="ivan@example.com" />
          </div>
          <div>
            <Label>Телефон</Label>
            <Input name="phone" type="tel" placeholder="+7 999 000 00 00" />
          </div>
          <div>
            <Label required>Пароль</Label>
            <Input name="password" type="password" required placeholder="Минимум 8 символов" />
          </div>
          {error && <ErrorBox message={error} />}
          <BtnSuccess type="submit" disabled={loading} className="w-full">
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </BtnSuccess>
        </form>
        <div className="mt-4 pt-4 border-t border-(--border) text-sm text-center text-(--fg-muted)">
          Уже есть аккаунт?{' '}
          <Link href="/login" className="text-(--primary-text) hover:underline">Войти</Link>
        </div>
      </div>
    </Card>
  );
}
