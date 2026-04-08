'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { extractApiError } from '@/lib/api/errors';
import { Input, Label, ErrorBox, BtnSuccess } from '@/components/ui';
import { Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="p-6">
      <h2 className="mb-1 text-xl font-bold text-(--fg)">Восстановление пароля</h2>
      <p className="mb-5 text-sm text-(--fg-muted)">Введите email для получения кода сброса</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
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
        className="space-y-4"
      >
        <div>
          <Label>Email</Label>
          <Input name="email" type="email" required placeholder="ivan@example.com" />
        </div>
        {error && <ErrorBox message={error} />}
        <BtnSuccess type="submit" disabled={loading} className="w-full">
          <Mail size={15} />
          {loading ? 'Отправка...' : 'Отправить код'}
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
