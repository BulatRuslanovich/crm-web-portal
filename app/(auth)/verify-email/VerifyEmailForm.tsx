'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/lib/auth-context';
import { authApi } from '@/lib/api/auth';
import { extractApiError } from '@/lib/api/errors';
import {
  CardSkeleton,
  Input,
  Label,
  ErrorBox,
  SuccessBox,
  BtnSuccess,
  FieldError,
} from '@/components/ui';
import { AuthFormShell } from '@/components/auth-form-shell';
import { ResendButton } from '@/components/resend-button';
import { useResendCode } from '@/lib/hooks/use-resend-code';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { authRules } from '@/lib/validation';

interface FormValues {
  code: string;
}

function VerifyEmailInner() {
  const { confirmEmail } = useAuth();
  const router = useRouter();
  const email = useSearchParams().get('email') ?? '';

  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { code: '' },
  });

  const {
    loading: resendLoading,
    message: resendMsg,
    error: resendError,
    cooldown,
    handleResend,
  } = useResendCode({ onResend: () => authApi.resendConfirmation(email) });

  async function onSubmit(values: FormValues) {
    setApiError(null);
    try {
      await confirmEmail(email, values.code);
      router.push('/dashboard');
    } catch (err) {
      setApiError(extractApiError(err));
    }
  }

  return (
    <AuthFormShell
      title="Подтверждение email"
      subtitle={
        <>
          Код отправлен на <span className="text-foreground font-medium">{email}</span>
        </>
      }
      icon={ShieldCheck}
      iconTone="success"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label required>Код подтверждения</Label>
          <Input
            type="text"
            maxLength={6}
            className="h-12! text-center! font-mono! text-xl! tracking-widest!"
            placeholder="000000"
            {...register('code', authRules.code)}
          />
          <FieldError message={errors.code?.message} />
        </div>

        {(apiError ?? resendError) && <ErrorBox message={(apiError ?? resendError)!} />}
        {resendMsg && <SuccessBox message={resendMsg} />}

        <BtnSuccess type="submit" disabled={isSubmitting} className="w-full">
          <ShieldCheck size={15} />
          {isSubmitting ? 'Проверка...' : 'Подтвердить'}
        </BtnSuccess>
      </form>

      <ResendButton onClick={handleResend} loading={resendLoading} cooldown={cooldown} />
    </AuthFormShell>
  );
}

export default function VerifyEmailForm() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <VerifyEmailInner />
    </Suspense>
  );
}
