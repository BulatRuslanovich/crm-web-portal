'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { extractApiError } from '@/lib/api/errors';
import { CardSkeleton, Input, Label, ErrorBox, BtnSuccess } from '@/components/ui';
import { KeyRound } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="p-6">
      <h2 className="mb-1 text-xl font-bold text-(--fg)">Новый пароль</h2>
      <p className="mb-5 text-sm text-(--fg-muted)">Введите код из письма и новый пароль</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          setError('');
          setLoading(true);
          try {
            await authApi.resetPassword(
              email,
              formData.get('code') as string,
              formData.get('newPassword') as string,
            );
            router.push('/login');
          } catch (err) {
            setError(extractApiError(err, 'Ошибка сброса пароля'));
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
        <div>
          <Label>Новый пароль</Label>
          <Input name="newPassword" type="password" required placeholder="Минимум 8 символов" />
        </div>
        {error && <ErrorBox message={error} />}
        <BtnSuccess type="submit" disabled={loading} className="w-full">
          <KeyRound size={15} />
          {loading ? 'Сохранение...' : 'Сохранить пароль'}
        </BtnSuccess>
      </form>
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
