'use client';

import { Controller } from 'react-hook-form';
import { Input, Label } from '@/components/ui';
import { Combobox, type ComboboxOption } from '@/components/Combobox';

/* eslint-disable @typescript-eslint/no-explicit-any */
type FormControl = any;
type FormRegister = any;

interface MainProps {
  register: FormRegister;
  control: FormControl;
  typeOptions: ComboboxOption[];
  withPlaceholders?: boolean;
}

export function OrgMainFields({ register, control, typeOptions, withPlaceholders }: MainProps) {
  return (
    <>
      <div>
        <Label required>Название</Label>
        <Input
          type="text"
          placeholder={withPlaceholders ? 'Городская больница №1' : undefined}
          {...register('orgName')}
        />
      </div>
      <div>
        <Label required>Тип</Label>
        <Controller
          name="orgTypeId"
          control={control}
          render={({ field }) => (
            <Combobox
              options={typeOptions}
              value={field.value}
              onChange={field.onChange}
              placeholder="Выберите тип"
              searchPlaceholder="Поиск типа..."
            />
          )}
        />
      </div>
    </>
  );
}

export function OrgInnField({
  register,
  withPlaceholder,
}: {
  register: FormRegister;
  withPlaceholder?: boolean;
}) {
  return (
    <div>
      <Label>ИНН</Label>
      <Input
        type="text"
        placeholder={withPlaceholder ? '0000000000' : undefined}
        {...register('inn')}
      />
    </div>
  );
}

interface LocationProps {
  register: FormRegister;
  withPlaceholders?: boolean;
}

export function OrgLocationFields({ register, withPlaceholders }: LocationProps) {
  return (
    <>
      <div>
        <Label>Адрес</Label>
        <Input
          type="text"
          placeholder={withPlaceholders ? 'г. Москва, ул. Примерная, 1' : undefined}
          {...register('address')}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Широта</Label>
          <Input
            type="number"
            step="any"
            placeholder={withPlaceholders ? '55.7558' : undefined}
            {...register('latitude')}
          />
        </div>
        <div>
          <Label>Долгота</Label>
          <Input
            type="number"
            step="any"
            placeholder={withPlaceholders ? '37.6173' : undefined}
            {...register('longitude')}
          />
        </div>
      </div>
    </>
  );
}
