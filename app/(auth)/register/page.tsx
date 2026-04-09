'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { extractApiError } from '@/lib/api/errors';
import { Input, Label, ErrorBox, BtnSuccess } from '@/components/ui';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [phone, setPhone] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  async function handleSubmit() {
    setError(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    try {
      const { email } = await register({
        login: login.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: emailValue.trim(),
        phone: phone.trim(),
      });

      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h2 className="mb-1 text-xl font-bold text-(--fg)">Регистрация</h2>
      <p className="mb-5 text-sm text-(--fg-muted)">Создайте аккаунт для работы с системой</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Имя</Label>
            <Input
              name="firstName"
              type="text"
              placeholder="Иван"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <Label>Фамилия</Label>
            <Input
              name="lastName"
              type="text"
              placeholder="Иванов"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label>Логин</Label>
          <Input
            name="login"
            type="text"
            placeholder="ivanov"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            name="email"
            type="email"
            placeholder="ivan@example.com"
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
          />
        </div>
        <div>
          <Label>Телефон</Label>
          <Input
            name="phone"
            type="tel"
            placeholder="+7 999 000 00 00"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <Label>Пароль</Label>
          <Input
            name="password"
            type="password"
            placeholder="Минимум 8 символов"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <Label>Подтвердите пароль</Label>
          <Input
            name="confirmPassword"
            type="password"
            placeholder="Минимум 8 символов"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && <ErrorBox message={error} />}

        <BtnSuccess type="submit" disabled={loading} className="w-full">
          <UserPlus size={15} />
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </BtnSuccess>
      </form>
      <div className="mt-5 border-t border-(--border) pt-5 text-center text-sm text-(--fg-muted)">
        Уже есть аккаунт?{' '}
        <Link href="/login" className="font-medium text-(--primary-text) hover:underline">
          Войти
        </Link>
      </div>
    </div>
  );
}
