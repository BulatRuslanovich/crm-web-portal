'use client';

import { Controller } from 'react-hook-form';
import type { Control, FieldValues, Path, UseFormRegister } from 'react-hook-form';
import { Input, Label } from '@/components/ui';
import { Combobox, type ComboboxOption } from '@/components/Combobox';

interface MainProps<T extends FieldValues> {
  register: UseFormRegister<T>;
  control: Control<T>;
  typeOptions: ComboboxOption[];
  withPlaceholders?: boolean;
}

export function OrgMainFields<T extends FieldValues>({
  register,
  control,
  typeOptions,
  withPlaceholders,
}: MainProps<T>) {
  return (
    <>
      <div>
        <Label required>Название</Label>
        <Input
          type="text"
          placeholder={withPlaceholders ? 'Городская больница №1' : undefined}
          {...register('orgName' as Path<T>)}
        />
      </div>
      <div>
        <Label required>Тип</Label>
        <Controller
          name={'orgTypeId' as Path<T>}
          control={control}
          render={({ field }) => (
            <Combobox
              options={typeOptions}
              value={field.value as string}
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

export function OrgInnField<T extends FieldValues>({
  register,
  withPlaceholder,
}: {
  register: UseFormRegister<T>;
  withPlaceholder?: boolean;
}) {
  return (
    <div>
      <Label>ИНН</Label>
      <Input
        type="text"
        placeholder={withPlaceholder ? '0000000000' : undefined}
        {...register('inn' as Path<T>)}
      />
    </div>
  );
}

interface LocationProps<T extends FieldValues> {
  register: UseFormRegister<T>;
  withPlaceholders?: boolean;
}

export function OrgLocationFields<T extends FieldValues>({
  register,
  withPlaceholders,
}: LocationProps<T>) {
  return (
    <>
      <div>
        <Label>Адрес</Label>
        <Input
          type="text"
          placeholder={withPlaceholders ? 'г. Москва, ул. Примерная, 1' : undefined}
          {...register('address' as Path<T>)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Широта</Label>
          <Input
            type="number"
            step="any"
            placeholder={withPlaceholders ? '55.7558' : undefined}
            {...register('latitude' as Path<T>)}
          />
        </div>
        <div>
          <Label>Долгота</Label>
          <Input
            type="number"
            step="any"
            placeholder={withPlaceholders ? '37.6173' : undefined}
            {...register('longitude' as Path<T>)}
          />
        </div>
      </div>
    </>
  );
}
