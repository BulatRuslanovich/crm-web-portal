'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/lib/auth-context';
import { extractApiError } from '@/lib/api/errors';
import { Input, Label, ErrorBox, BtnSuccess } from '@/components/ui';
import { UserPlus } from 'lucide-react';
import { AuthFormShell } from '@/components/auth/auth-form-shell';

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  login: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterForm() {
  const { register: authRegister } = useAuth();
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      login: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setApiError(null);

    if (values.password !== values.confirmPassword) {
      setApiError('Пароли не совпадают');
      return;
    }

    try {
      const { email } = await authRegister({
        login: values.login.trim(),
        password: values.password,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
      });

      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setApiError(extractApiError(err));
    }
  }

  return (

    <AuthFormShell
      title="Регистрация"
      subtitle="Создайте аккаунт для работы с системой"
      footer={
        <>
            <span className="text-muted-foreground">
              Нет аккаунта?{' '}
              <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
                Войти
              </Link>
            </span>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required>Имя</Label>
            <Input type="text" placeholder="Иван" {...register('firstName')} />
          </div>
          <div>
            <Label required>Фамилия</Label>
            <Input type="text" placeholder="Иванов" {...register('lastName')} />
          </div>
        </div>
        <div>
          <Label required>Логин</Label>
          <Input type="text" placeholder="ivanov" {...register('login')} />
        </div>
        <div>
          <Label required>Email</Label>
          <Input type="email" placeholder="ivan@example.com" {...register('email')} />
        </div>
        <div>
          <Label required>Пароль</Label>
          <Input type="password" placeholder="Минимум 8 символов" {...register('password')} />
        </div>
        <div>
          <Label required>Подтвердите пароль</Label>
          <Input
            type="password"
            placeholder="Минимум 8 символов"
            {...register('confirmPassword')}
          />
        </div>

        {apiError && <ErrorBox message={apiError} />}

        <BtnSuccess type="submit" disabled={isSubmitting} className="w-full">
          <UserPlus size={15} />
          {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
        </BtnSuccess>
      </form>
    </AuthFormShell>
  );
}
