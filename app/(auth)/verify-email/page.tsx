'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authApi } from '@/lib/api/auth';
import { extractApiError } from '@/lib/api/errors';
import { Card, CardSkeleton, Input, Label, ErrorBox, SuccessBox, BtnSuccess } from '@/components/ui';

function VerifyEmailForm() {
  const { confirmEmail } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  async function handleResend() {
    try {
      await authApi.resendConfirmation(email);
      setResendMsg('Код отправлен повторно');
    } catch {
      setResendMsg('Не удалось отправить код');
    }
  }

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-(--fg) mb-1">Подтверждение email</h2>
        <p className="text-sm text-(--fg-muted) mb-5">
          Код отправлен на <span className="font-medium text-(--fg)">{email}</span>
        </p>
        <form
          action={async (formData: FormData) => {
            setError('');
            setLoading(true);
            try {
              await confirmEmail(email, formData.get('code') as string);
              router.push('/dashboard');
            } catch (err) {
              setError(extractApiError(err, 'Неверный код'));
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-3"
        >
          <div>
            <Label>Код подтверждения</Label>
            <Input
              name="code"
              type="text"
              required
              maxLength={6}
              className="h-10! text-center! text-xl! tracking-widest!"
              placeholder="000000"
            />
          </div>
          {error && <ErrorBox message={error} />}
          {resendMsg && <SuccessBox message={resendMsg} />}
          <BtnSuccess type="submit" disabled={loading} className="w-full">
            {loading ? 'Проверка...' : 'Подтвердить'}
          </BtnSuccess>
        </form>
        <button
          onClick={handleResend}
          className="mt-3 w-full text-sm text-(--fg-muted) hover:text-(--fg) transition-colors cursor-pointer"
        >
          Отправить повторно
        </button>
      </div>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <VerifyEmailForm />
    </Suspense>
  );
}
