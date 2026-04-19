'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/lib/auth-context';
import { extractApiError } from '@/lib/api/errors';
import { Input, Label, ErrorBox, BtnSuccess } from '@/components/ui';
import { LogIn } from 'lucide-react';
import { AuthFormShell } from '@/app/(auth)/_components/auth-form-shell';

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
    <AuthFormShell
      title="Вход"
      subtitle="Войдите в свой аккаунт"
      icon={LogIn}
      iconTone="success"
  footer={
    <>
        <Link href="/forgot-password" className="text-foreground underline-offset-4 hover:underline">
          Забыли пароль?
        </Link>

        <span className="text-muted-foreground">
          Нет аккаунта?{' '}
          <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
            Зарегистрироваться
          </Link>
        </span>
    </>
  }
>

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

      </AuthFormShell>
  );
}
