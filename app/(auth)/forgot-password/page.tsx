'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { extractApiError } from '@/lib/api/errors';
import { Card, Input, Label, ErrorBox, BtnSuccess } from '@/components/ui';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-(--fg) mb-1">Восстановление пароля</h2>
        <p className="text-sm text-(--fg-muted) mb-5">Введите email для получения кода сброса</p>
        <form
          action={async (formData: FormData) => {
            setError('');
            setLoading(true);
            try {
              const email = formData.get('email') as string;
              await authApi.forgotPassword(email);
              router.push(`/reset-password?email=${encodeURIComponent(email)}`);
            } catch (err) {
              setError(extractApiError(err, 'Ошибка отправки письма'));
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-3"
        >
          <div>
            <Label>Email</Label>
            <Input name="email" type="email" required placeholder="ivan@example.com" />
          </div>
          {error && <ErrorBox message={error} />}
          <BtnSuccess type="submit" disabled={loading} className="w-full">
            {loading ? 'Отправка...' : 'Отправить код'}
          </BtnSuccess>
        </form>
        <div className="mt-4 pt-4 border-t border-(--border) text-sm text-center">
          <Link href="/login" className="text-(--primary-text) hover:underline">Вернуться ко входу</Link>
        </div>
      </div>
    </Card>
  );
}
