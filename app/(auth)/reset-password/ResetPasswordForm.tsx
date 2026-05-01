'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { authApi } from '@/lib/api/auth';
import { extractApiError } from '@/lib/api/errors';
import {
  CardSkeleton,
  Input,
  Label,
  ErrorBox,
  SuccessBox,
  BtnSuccess,
  FieldError,
} from '@/components/ui';
import { AuthFormShell } from '@/components/auth-form-shell';
import { ResendButton } from '@/components/resend-button';
import { useResendCode } from '@/lib/hooks/use-resend-code';
import { KeyRound } from 'lucide-react';
import { authRules } from '@/lib/validation';

interface FormValues {
  code: string;
  password: string;
  confirmPassword: string;
}

function ResetPasswordInner() {
  const router = useRouter();
  const email = useSearchParams().get('email') ?? '';

  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { code: '', password: '', confirmPassword: '' },
  });

  const {
    loading: resendLoading,
    message: resendMsg,
    error: resendError,
    cooldown,
    handleResend,
  } = useResendCode({ onResend: () => authApi.forgotPassword(email) });

  async function onSubmit(values: FormValues) {
    setApiError(null);
    if (values.password !== values.confirmPassword) {
      setApiError('Пароли не совпадают');
      return;
    }
    try {
      await authApi.resetPassword(email, values.code.trim(), values.password);
      router.push('/login');
    } catch (err) {
      setApiError(extractApiError(err));
    }
  }

  return (
    <AuthFormShell
      title="Новый пароль"
      subtitle="Введите код из письма и новый пароль"
      icon={KeyRound}
      iconTone="warning"
      footer={
        <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
          Вернуться ко входу
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label required>Код подтверждения</Label>
          <Input
            type="text"
            maxLength={6}
            className="h-12! text-center! font-mono! text-xl! tracking-widest!"
            placeholder="000000"
            {...register('code', authRules.code)}
          />
          <FieldError message={errors.code?.message} />
        </div>
        <div>
          <Label required>Новый пароль</Label>
          <Input
            type="password"
            placeholder="••••••••"
            {...register('password', authRules.password)}
          />
          <FieldError message={errors.password?.message} />
        </div>
        <div>
          <Label required>Подтвердите пароль</Label>
          <Input
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword', {
              required: 'Подтвердите пароль',
              validate: (v) => v === getValues('password') || 'Пароли не совпадают',
            })}
          />
          <FieldError message={errors.confirmPassword?.message} />
        </div>

        {(apiError ?? resendError) && <ErrorBox message={(apiError ?? resendError)!} />}
        {resendMsg && <SuccessBox message={resendMsg} />}

        <BtnSuccess type="submit" disabled={isSubmitting} className="w-full">
          <KeyRound size={15} />
          {isSubmitting ? 'Сбрасывание...' : 'Сбросить пароль'}
        </BtnSuccess>
      </form>

      <ResendButton
        onClick={handleResend}
        loading={resendLoading}
        cooldown={cooldown}
        labels={{
          cooldown: (s) => `Отправить код повторно через ${s} сек`,
          idle: 'Отправить код повторно',
        }}
      />
    </AuthFormShell>
  );
}

export default function ResetPasswordForm() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <ResetPasswordInner />
    </Suspense>
  );
}
