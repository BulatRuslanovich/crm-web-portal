'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { useApi } from '@/lib/use-api';
import { physesApi } from '@/lib/api/physes';
import { specsApi } from '@/lib/api/specs';
import { extractApiError } from '@/lib/api/errors';
import {
  BackButton,
  Card,
  CardFooter,
  Label,
  Input,
  ErrorBox,
  BtnSecondary,
  BtnSuccess,
} from '@/components/ui';
import { Combobox } from '@/components/Combobox';

interface FormValues {
  lastName: string;
  firstName: string;
  middleName: string;
  specId: string;
  position: string;
  phone: string;
  email: string;
}

export default function CreatePhysPage() {
  const router = useRouter();
  const { data: specs = [] } = useApi(
    'specs',
    () => specsApi.getAll().then(({ data }) => data),
    { dedupingInterval: 300_000 },
  );
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      lastName: '',
      firstName: '',
      middleName: '',
      specId: '',
      position: '',
      phone: '',
      email: '',
    },
  });

  const specOptions = specs.map((s) => ({
    value: String(s.specId),
    label: s.specName,
  }));

  async function onSubmit(values: FormValues) {
    setApiError('');
    try {
      const { data } = await physesApi.create({
        specId: Number(values.specId),
        lastName: values.lastName,
        firstName: values.firstName,
        middleName: values.middleName,
        phone: values.phone,
        email: values.email,
      });
      router.push(`/physes/${data.physId}`);
    } catch (err) {
      setApiError(extractApiError(err, 'Ошибка создания'));
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center gap-3">
        <BackButton />
        <h2 className="text-xl font-semibold text-(--fg)">Новый врач</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <div className="space-y-4 p-4">
            <div>
              <Label required>Фамилия</Label>
              <Input type="text" placeholder="Иванов" {...register('lastName')} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Имя</Label>
                <Input type="text" placeholder="Иван" {...register('firstName')} />
              </div>
              <div>
                <Label>Отчество</Label>
                <Input type="text" placeholder="Иванович" {...register('middleName')} />
              </div>
            </div>
            <div>
              <Label required>Специальность</Label>
              <Controller
                name="specId"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Combobox
                    options={specOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Выберите специальность"
                    searchPlaceholder="Поиск специальности..."
                  />
                )}
              />
            </div>
            <div>
              <Label>Должность</Label>
              <Input type="text" placeholder="Главный врач" {...register('position')} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Телефон</Label>
                <Input type="tel" placeholder="+7 999 000 00 00" {...register('phone')} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="doctor@example.com" {...register('email')} />
              </div>
            </div>
            {apiError && <ErrorBox message={apiError} />}
          </div>
          <CardFooter>
            <BtnSecondary type="button" onClick={() => router.back()}>
              Отмена
            </BtnSecondary>
            <BtnSuccess type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Создание...' : 'Создать'}
            </BtnSuccess>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
