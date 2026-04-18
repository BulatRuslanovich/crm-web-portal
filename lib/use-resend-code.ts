import { useState, useEffect, useRef, useCallback } from 'react';
import { extractApiError } from '@/lib/api/errors';

interface UseResendCodeOptions {
  onResend: () => Promise<unknown>;
  successMessage?: string;
  cooldownSeconds?: number;
}

export function useResendCode({
  onResend,
  successMessage = 'Код отправлен повторно',
  cooldownSeconds = 60,
}: UseResendCodeOptions) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCooldown = useCallback(
    (seconds: number) => {
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
    },
    [],
  );

  const handleResend = useCallback(async () => {
    setLoading(true);
    setMessage('');
    setError(null);
    try {
      await onResend();
      setMessage(successMessage);
      startCooldown(cooldownSeconds);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, [onResend, successMessage, cooldownSeconds, startCooldown]);

  return { loading, message, error, cooldown, handleResend };
}