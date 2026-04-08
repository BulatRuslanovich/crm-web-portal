'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { extractApiError } from '@/lib/api/errors';
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
                firstName: (formData.get('firstName') as string) || '',
                lastName: (formData.get('lastName') as string) || '',
                email: (formData.get('email') as string) || '',
                phone: (formData.get('phone') as string) || '',
              });
              router.push(`/verify-email?email=${encodeURIComponent(email)}`);
            } catch (err) {
              setError(extractApiError(err, 'Ошибка регистрации'));
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
            <Label>Логин</Label>
            <Input name="login" type="text" placeholder="ivanov" />
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
            <Label>Пароль</Label>
            <Input name="password" type="password" placeholder="12345678" />
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
