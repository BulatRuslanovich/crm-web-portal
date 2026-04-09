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

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit() {
    setError(null);
    setLoading(true);

    try {
      await login(loginValue, password);
      router.push('/dashboard');
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h2 className="mb-1 text-xl font-bold text-(--fg)">Вход</h2>
      <p className="mb-5 text-sm text-(--fg-muted)">Войдите в свой аккаунт</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <Label>Логин</Label>
          <Input
            name="login"
            type="text"
            placeholder="Введите логин"
            value={loginValue}
            onChange={(e) => setLoginValue(e.target.value)}
          />
        </div>

        <div>
          <Label>Пароль</Label>
          <Input
            name="password"
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
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
