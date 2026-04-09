'use client';

import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authApi } from '@/lib/api/auth';
import { extractApiError } from '@/lib/api/errors';
import { CardSkeleton, Input, Label, ErrorBox, SuccessBox, BtnSuccess } from '@/components/ui';
import { ShieldCheck } from 'lucide-react';

function VerifyEmailForm() {
  const { confirmEmail } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    setError(null);

    try {
      await authApi.resendConfirmation(email);
      setResendMsg('Код отправлен повторно');
      startCooldown(60);
    } catch (err) {
      setError(extractApiError(err, 'Неизвестная ошибка'));
    } finally {
      setResendLoading(false);
    }
  }

  async function handleSubmit() {
    setError(null);
    setLoading(true);

    try {
      await confirmEmail(email, code);
      router.push('/dashboard');
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h2 className="mb-1 text-xl font-bold text-(--fg)">Подтверждение email</h2>
      <p className="mb-5 text-sm text-(--fg-muted)">
        Код отправлен на <span className="font-medium text-(--fg)">{email}</span>
      </p>
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <Label>Код подтверждения</Label>
          <Input
            name="code"
            type="text"
            maxLength={6}
            className="h-12! text-center! font-mono! text-xl! tracking-widest!"
            placeholder="000000"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
            }}
          />
        </div>

        {error && <ErrorBox message={error} />}

        {resendMsg && <SuccessBox message={resendMsg} />}

        <BtnSuccess type="submit" disabled={loading} className="w-full">
          <ShieldCheck size={15} />
          {loading ? 'Проверка...' : 'Подтвердить'}
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <VerifyEmailForm />
    </Suspense>
  );
}
