'use client';

import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/lib/auth-context';
import { authApi } from '@/lib/api/auth';
import { extractApiError } from '@/lib/api/errors';
import { CardSkeleton, Input, Label, ErrorBox, SuccessBox, BtnSuccess } from '@/components/ui';
import { ShieldCheck } from 'lucide-react';

interface FormValues {
  code: string;
}

function VerifyEmailInner() {
  const { confirmEmail } = useAuth();
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
  } = useForm<FormValues>({ defaultValues: { code: '' } });

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
      await authApi.resendConfirmation(email);
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
    try {
      await confirmEmail(email, values.code);
      router.push('/dashboard');
    } catch (err) {
      setApiError(extractApiError(err));
    }
  }

  return (
    <div className="p-6">
      <h2 className="mb-1 text-xl font-bold text-(--fg)">Подтверждение email</h2>
      <p className="mb-5 text-sm text-(--fg-muted)">
        Код отправлен на <span className="font-medium text-(--fg)">{email}</span>
      </p>
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

        {apiError && <ErrorBox message={apiError} />}
        {resendMsg && <SuccessBox message={resendMsg} />}

        <BtnSuccess type="submit" disabled={isSubmitting} className="w-full">
          <ShieldCheck size={15} />
          {isSubmitting ? 'Проверка...' : 'Подтвердить'}
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
            ? `Отправить повторно через ${cooldown} сек`
            : 'Отправить повторно'}
      </button>
    </div>
  );
}

export default function VerifyEmailForm() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <VerifyEmailInner />
    </Suspense>
  );
}
