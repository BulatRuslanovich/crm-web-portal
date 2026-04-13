'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { authApi } from '@/lib/api/auth';
import { extractApiError } from '@/lib/api/errors';
import { Input, Label, ErrorBox, BtnSuccess } from '@/components/ui';
import { Mail } from 'lucide-react';

interface FormValues {
  email: string;
}

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({ defaultValues: { email: '' } });

  async function onSubmit(values: FormValues) {
    setApiError(null);
    try {
      await authApi.forgotPassword(values.email.trim());
      router.push(`/reset-password?email=${encodeURIComponent(values.email.trim())}`);
    } catch (err) {
      setApiError(extractApiError(err));
    }
  }

  return (
    <div className="p-6">
      <h2 className="mb-1 text-xl font-bold text-(--fg)">Восстановление пароля</h2>
      <p className="mb-5 text-sm text-(--fg-muted)">Введите email для получения кода сброса</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input type="email" placeholder="ivan@example.com" {...register('email')} />
        </div>

        {apiError && <ErrorBox message={apiError} />}

        <BtnSuccess type="submit" disabled={isSubmitting} className="w-full">
          <Mail size={15} />
          {isSubmitting ? 'Отправка...' : 'Отправить код'}
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
