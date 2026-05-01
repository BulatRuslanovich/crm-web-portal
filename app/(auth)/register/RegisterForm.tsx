'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/lib/auth-context';
import { extractApiError } from '@/lib/api/errors';
import { Input, Label, ErrorBox, BtnSuccess, FieldError } from '@/components/ui';
import { UserPlus } from 'lucide-react';
import { AuthFormShell } from '@/components/auth-form-shell';
import { authRules } from '@/lib/validation';

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
  const { register: authRegister, login } = useAuth();
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
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
      const { email, emailConfirmationRequired } = await authRegister({
        login: values.login.trim(),
        password: values.password,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
      });

      if (emailConfirmationRequired) {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        await login(values.login.trim(), values.password);
        router.push('/dashboard');
      }
    } catch (err) {
      setApiError(extractApiError(err));
    }
  }

  return (
    <AuthFormShell
      title="Регистрация"
      subtitle="Создайте аккаунт для работы с системой"
      icon={UserPlus}
      iconTone="primary"
      footer={
        <>
          <span className="text-muted-foreground">
            Есть аккаунт?{' '}
            <Link
              href="/login"
              className="text-foreground font-medium underline-offset-4 hover:underline"
            >
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
            <Input type="text" placeholder="Иван" {...register('firstName', authRules.firstName)} />
            <FieldError message={errors.firstName?.message} />
          </div>
          <div>
            <Label required>Фамилия</Label>
            <Input type="text" placeholder="Иванов" {...register('lastName', authRules.lastName)} />
            <FieldError message={errors.lastName?.message} />
          </div>
        </div>
        <div>
          <Label required>Логин</Label>
          <Input type="text" placeholder="ivanov" {...register('login', authRules.login)} />
          <FieldError message={errors.login?.message} />
        </div>
        <div>
          <Label required>Email</Label>
          <Input
            type="email"
            placeholder="ivan@example.com"
            {...register('email', authRules.email)}
          />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label required>Пароль</Label>
          <Input
            type="password"
            placeholder="Минимум 8 символов"
            {...register('password', authRules.password)}
          />
          <FieldError message={errors.password?.message} />
        </div>
        <div>
          <Label required>Подтвердите пароль</Label>
          <Input
            type="password"
            placeholder="Минимум 8 символов"
            {...register('confirmPassword', {
              required: 'Подтвердите пароль',
              validate: (v) => v === getValues('password') || 'Пароли не совпадают',
            })}
          />
          <FieldError message={errors.confirmPassword?.message} />
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
