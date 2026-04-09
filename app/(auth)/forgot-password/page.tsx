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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  async function handleSubmit() {
    setError(null);
    setLoading(true);

    if (!email.trim()) {
      setError('Введите email');
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Некорректный email');
      setLoading(false);
      return;
    }

    try {
      await authApi.forgotPassword(email.trim());
      router.push(`/reset-password?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h2 className="mb-1 text-xl font-bold text-(--fg)">Восстановление пароля</h2>
      <p className="mb-5 text-sm text-(--fg-muted)">Введите email для получения кода сброса</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <Label>Email</Label>
          <Input
            name="email"
            type="email"
            placeholder="ivan@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
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
