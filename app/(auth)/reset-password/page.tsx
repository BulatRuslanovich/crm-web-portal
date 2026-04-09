'use client';

import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { extractApiError } from '@/lib/api/errors';
import { CardSkeleton, Input, Label, ErrorBox, SuccessBox, BtnSuccess } from '@/components/ui';
import { KeyRound } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

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
      await authApi.forgotPassword(email);
      setResendMsg('Код отправлен повторно');
      startCooldown(60);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setResendLoading(false);
    }
  }

  const [code, setCode] = useState('');
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
      await authApi.resetPassword(email, code.trim(), password);
      router.push('/login');
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h2 className="mb-1 text-xl font-bold text-(--fg)">Новый пароль</h2>
      <p className="mb-5 text-sm text-(--fg-muted)">Введите код из письма и новый пароль</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <Label>Код подтверждения</Label>
          <Input
            name="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            className="h-12! text-center! font-mono! text-xl! tracking-widest!"
            placeholder="000000"
          />
        </div>

        <div>
          <Label>Новый пароль</Label>
          <Input
            name="newPassword"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <Label>Подтвердите пароль</Label>
          <Input
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && <ErrorBox message={error} />}

        {resendMsg && <SuccessBox message={resendMsg} />}

        <BtnSuccess type="submit" disabled={loading} className="w-full">
          <KeyRound size={15} />
          {loading ? 'Cбрасывание...' : 'Сбросить пароль'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
