'use client';

import { Controller } from 'react-hook-form';
import { Input, Label } from '@/components/ui';
import { Combobox, type ComboboxOption } from '@/components/Combobox';

/* eslint-disable @typescript-eslint/no-explicit-any */
type FormControl = any;
type FormRegister = any;

interface NameProps {
  register: FormRegister;
  withPlaceholders?: boolean;
  requireMiddleName?: boolean;
}

export function PhysNameFields({ register, withPlaceholders, requireMiddleName }: NameProps) {
  return (
    <>
      <div>
        <Label required>Фамилия</Label>
        <Input
          type="text"
          placeholder={withPlaceholders ? 'Иванов' : undefined}
          {...register('lastName')}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label required>Имя</Label>
          <Input
            type="text"
            placeholder={withPlaceholders ? 'Иван' : undefined}
            {...register('firstName')}
          />
        </div>
        <div>
          <Label required={requireMiddleName}>Отчество</Label>
          <Input
            type="text"
            placeholder={withPlaceholders ? 'Иванович' : undefined}
            {...register('middleName')}
          />
        </div>
      </div>
    </>
  );
}

interface ContactProps {
  register: FormRegister;
  withPlaceholders?: boolean;
  required?: boolean;
}

export function PhysContactFields({ register, withPlaceholders, required }: ContactProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label required={required}>Телефон</Label>
        <Input
          type="tel"
          placeholder={withPlaceholders ? '+7 999 000 00 00' : undefined}
          {...register('phone')}
        />
      </div>
      <div>
        <Label required={required}>Email</Label>
        <Input
          type="email"
          placeholder={withPlaceholders ? 'doctor@example.com' : undefined}
          {...register('email')}
        />
      </div>
    </div>
  );
}

interface SpecProps {
  control: FormControl;
  options: ComboboxOption[];
  required?: boolean;
  placeholder?: string;
}

export function PhysSpecField({ control, options, required, placeholder }: SpecProps) {
  return (
    <div>
      <Label required={required}>Специальность</Label>
      <Controller
        name="specId"
        control={control}
        rules={{ required }}
        render={({ field }) => (
          <Combobox
            options={options}
            value={field.value}
            onChange={field.onChange}
            placeholder={placeholder ?? 'Выберите специальность'}
            searchPlaceholder="Поиск специальности..."
          />
        )}
      />
    </div>
  );
}
