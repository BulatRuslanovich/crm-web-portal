'use client';

import { BtnPrimary, BtnSecondary, BtnSuccess, CardFooter } from '@/components/ui';

interface Props {
  onCancel: () => void;
  isSubmitting: boolean;
  label: string;
  variant?: 'create' | 'edit';
}

export function FormCardFooter({ onCancel, isSubmitting, label, variant = 'edit' }: Props) {
  const savingLabel = variant === 'create' ? 'Создание...' : 'Сохранение...';
  return (
    <CardFooter>
      <BtnSecondary type="button" onClick={onCancel}>
        Отмена
      </BtnSecondary>
      {variant === 'create' ? (
        <BtnSuccess type="submit" disabled={isSubmitting}>
          {isSubmitting ? savingLabel : label}
        </BtnSuccess>
      ) : (
        <BtnPrimary type="submit" disabled={isSubmitting}>
          {isSubmitting ? savingLabel : label}
        </BtnPrimary>
      )}
    </CardFooter>
  );
}
