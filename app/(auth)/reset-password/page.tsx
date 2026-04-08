'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { extractApiError } from '@/lib/api/errors';
import { Card, CardSkeleton, Input, Label, ErrorBox, BtnSuccess } from '@/components/ui';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-(--fg) mb-1">Новый пароль</h2>
        <p className="text-sm text-(--fg-muted) mb-5">Введите код из письма и новый пароль</p>
        <form
          action={async (formData: FormData) => {
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
          <div>
            <Label>Новый пароль</Label>
            <Input name="newPassword" type="password" required placeholder="Минимум 8 символов" />
          </div>
          {error && <ErrorBox message={error} />}
          <BtnSuccess type="submit" disabled={loading} className="w-full">
            {loading ? 'Сохранение...' : 'Сохранить пароль'}
          </BtnSuccess>
        </form>
        <div className="mt-4 pt-4 border-t border-(--border) text-sm text-center">
          <Link href="/login" className="text-(--primary-text) hover:underline">Вернуться ко входу</Link>
        </div>
      </div>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
