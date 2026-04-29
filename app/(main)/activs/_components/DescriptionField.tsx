'use client';

import { Controller } from 'react-hook-form';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { FileText } from 'lucide-react';
import { SectionLabel, Textarea } from '@/components/ui';

export function DescriptionField<T extends FieldValues>({ control }: { control: Control<T> }) {
  return (
    <div>
      <SectionLabel icon={FileText}>Описание</SectionLabel>
      <Controller
        name={'description' as Path<T>}
        control={control}
        render={({ field }) => (
          <Textarea
            rows={3}
            placeholder="Описание визита..."
            value={(field.value as string) ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
            name={field.name}
          />
        )}
      />
    </div>
  );
}
