'use client';

import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { authApi } from '@/lib/api/auth';
import { extractApiError } from '@/lib/api/errors';
import { CardSkeleton, Input, Label, ErrorBox, SuccessBox, BtnSuccess } from '@/components/ui';
import { KeyRound } from 'lucide-react';

interface FormValues {
  code: string;
  password: string;
  confirmPassword: string;
}

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [apiError, setApiError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({ defaultValues: { code: '', password: '', confirmPassword: '' } });

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCooldown = useCallback((seconds: number) => {
    setCooldown(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  async function handleResend() {
    setResendLoading(true);
    setResendMsg('');
    setApiError(null);
    try {
      await authApi.forgotPassword(email);
      setResendMsg('Код отправлен повторно');
      startCooldown(60);
    } catch (err) {
      setApiError(extractApiError(err));
    } finally {
      setResendLoading(false);
    }
  }

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
    <div className="p-6">
      <h2 className="mb-1 text-xl font-bold text-(--fg)">Новый пароль</h2>
      <p className="mb-5 text-sm text-(--fg-muted)">Введите код из письма и новый пароль</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Код подтверждения</Label>
          <Input
            type="text"
            maxLength={6}
            className="h-12! text-center! font-mono! text-xl! tracking-widest!"
            placeholder="000000"
            {...register('code')}
          />
        </div>

        <div>
          <Label>Новый пароль</Label>
          <Input type="password" placeholder="••••••••" {...register('password')} />
        </div>

        <div>
          <Label>Подтвердите пароль</Label>
          <Input type="password" placeholder="••••••••" {...register('confirmPassword')} />
        </div>

        {apiError && <ErrorBox message={apiError} />}
        {resendMsg && <SuccessBox message={resendMsg} />}

        <BtnSuccess type="submit" disabled={isSubmitting} className="w-full">
          <KeyRound size={15} />
          {isSubmitting ? 'Cбрасывание...' : 'Сбросить пароль'}
        </BtnSuccess>
      </form>

      <button
        onClick={handleResend}
        disabled={resendLoading || cooldown > 0}
        className="mt-4 w-full cursor-pointer text-sm text-(--fg-muted) transition-colors hover:text-(--primary-text) disabled:cursor-default disabled:opacity-50 disabled:hover:text-(--fg-muted)"
      >
        {resendLoading
          ? 'Отправка...'
          : cooldown > 0
            ? `Отправить код повторно через ${cooldown} сек`
            : 'Отправить код повторно'}
      </button>

      <div className="mt-5 border-t border-(--border) pt-5 text-center text-sm">
        <Link href="/login" className="text-(--primary-text) hover:underline">
          Вернуться ко входу
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordForm() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <ResetPasswordInner />
    </Suspense>
  );
}
