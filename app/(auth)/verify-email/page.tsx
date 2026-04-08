'use client';

import { Suspense, useState } from 'react';
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
    <div className="p-6">
      <h2 className="mb-1 text-xl font-bold text-(--fg)">Подтверждение email</h2>
      <p className="mb-5 text-sm text-(--fg-muted)">
        Код отправлен на <span className="font-medium text-(--fg)">{email}</span>
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
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
        className="space-y-4"
      >
        <div>
          <Label>Код подтверждения</Label>
          <Input
            name="code"
            type="text"
            required
            maxLength={6}
            className="h-12! text-center! font-mono! text-xl! tracking-widest!"
            placeholder="000000"
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
        className="mt-4 w-full cursor-pointer text-sm text-(--fg-muted) transition-colors hover:text-(--primary-text)"
      >
        Отправить повторно
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
