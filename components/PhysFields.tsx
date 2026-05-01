'use client';

import { Controller } from 'react-hook-form';
import type { Control, FieldValues, Path, UseFormRegister } from 'react-hook-form';
import { Input, Label } from '@/components/ui';
import { Combobox, type ComboboxOption } from '@/components/Combobox';

interface NameProps<T extends FieldValues> {
  register: UseFormRegister<T>;
  withPlaceholders?: boolean;
  requireMiddleName?: boolean;
}

export function PhysNameFields<T extends FieldValues>({
  register,
  withPlaceholders,
  requireMiddleName,
}: NameProps<T>) {
  return (
    <>
      <div>
        <Label required>Фамилия</Label>
        <Input
          type="text"
          placeholder={withPlaceholders ? 'Иванов' : undefined}
          {...register('lastName' as Path<T>)}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label required>Имя</Label>
          <Input
            type="text"
            placeholder={withPlaceholders ? 'Иван' : undefined}
            {...register('firstName' as Path<T>)}
          />
        </div>
        <div>
          <Label required={requireMiddleName}>Отчество</Label>
          <Input
            type="text"
            placeholder={withPlaceholders ? 'Иванович' : undefined}
            {...register('middleName' as Path<T>)}
          />
        </div>
      </div>
    </>
  );
}

interface ContactProps<T extends FieldValues> {
  register: UseFormRegister<T>;
  withPlaceholders?: boolean;
  required?: boolean;
}

export function PhysContactFields<T extends FieldValues>({
  register,
  withPlaceholders,
  required,
}: ContactProps<T>) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label required={required}>Телефон</Label>
        <Input
          type="tel"
          placeholder={withPlaceholders ? '+7 999 000 00 00' : undefined}
          {...register('phone' as Path<T>)}
        />
      </div>
      <div>
        <Label required={required}>Email</Label>
        <Input
          type="email"
          placeholder={withPlaceholders ? 'doctor@example.com' : undefined}
          {...register('email' as Path<T>)}
        />
      </div>
    </div>
  );
}

interface SpecProps<T extends FieldValues> {
  control: Control<T>;
  options: ComboboxOption[];
  required?: boolean;
  placeholder?: string;
}

export function PhysSpecField<T extends FieldValues>({
  control,
  options,
  required,
  placeholder,
}: SpecProps<T>) {
  return (
    <div>
      <Label required={required}>Специальность</Label>
      <Controller
        name={'specId' as Path<T>}
        control={control}
        rules={{ required }}
        render={({ field }) => (
          <Combobox
            options={options}
            value={field.value as string}
            onChange={field.onChange}
            placeholder={placeholder ?? 'Выберите специальность'}
            searchPlaceholder="Поиск специальности..."
          />
        )}
      />
    </div>
  );
}
