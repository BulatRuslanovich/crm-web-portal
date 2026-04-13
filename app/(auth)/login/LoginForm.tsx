'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/lib/auth-context';
import { extractApiError } from '@/lib/api/errors';
import { Input, Label, ErrorBox, BtnSuccess } from '@/components/ui';
import { LogIn } from 'lucide-react';

interface FormValues {
  login: string;
  password: string;
}

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({ defaultValues: { login: '', password: '' } });

  async function onSubmit(values: FormValues) {
    setApiError(null);
    try {
      await login(values.login, values.password);
      router.push('/dashboard');
    } catch (err) {
      setApiError(extractApiError(err));
    }
  }

  return (
    <div className="p-6">
      <h2 className="mb-1 text-xl font-bold text-(--fg)">Вход</h2>
      <p className="mb-5 text-sm text-(--fg-muted)">Войдите в свой аккаунт</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Логин</Label>
          <Input type="text" placeholder="Введите логин" {...register('login')} />
        </div>

        <div>
          <Label>Пароль</Label>
          <Input type="password" placeholder="Введите пароль" {...register('password')} />
        </div>

        {apiError && <ErrorBox message={apiError} />}

        <BtnSuccess type="submit" disabled={isSubmitting} className="w-full">
          <LogIn size={15} />
          {isSubmitting ? 'Вход...' : 'Войти'}
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
