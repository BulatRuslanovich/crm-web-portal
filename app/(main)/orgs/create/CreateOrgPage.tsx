'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { useApi } from '@/lib/use-api';
import { orgsApi } from '@/lib/api/orgs';
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
  orgTypeId: string;
  orgName: string;
  inn: string;
  address: string;
  latitude: string;
  longitude: string;
}

export default function CreateOrgPage() {
  const router = useRouter();
  const { data: types = [] } = useApi(
    'org-types',
    () => orgsApi.getTypes().then(({ data }) => data),
    { dedupingInterval: 300_000 },
  );
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { orgTypeId: '', orgName: '', inn: '', address: '', latitude: '', longitude: '' },
  });

  const typeOptions = types.map((t) => ({
    value: String(t.orgTypeId),
    label: t.orgTypeName,
  }));

  async function onSubmit(values: FormValues) {
    setApiError('');
    try {
      const { data } = await orgsApi.create({
        orgTypeId: Number(values.orgTypeId),
        orgName: values.orgName,
        inn: values.inn || '',
        address: values.address || '',
        latitude: values.latitude ? Number(values.latitude) : 0,
        longitude: values.longitude ? Number(values.longitude) : 0,
      });
      router.push(`/orgs/${data.orgId}`);
    } catch (err) {
      setApiError(extractApiError(err, 'Неизвестная ошибка при создании организации'));
    }
  }

  return (
    <div className="mx-auto w-full">
      <div className="mb-5 flex items-center gap-3">
        <BackButton />
        <h2 className="text-xl font-semibold text-(--fg)">Новая организация</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <div className="space-y-4 p-4">
            <div>
              <Label>Тип организации</Label>
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
            <div>
              <Label>Название</Label>
              <Input
                type="text"
                placeholder="Городская больница №1"
                {...register('orgName')}
              />
            </div>
            <div>
              <Label>ИНН</Label>
              <Input type="text" placeholder="0000000000" {...register('inn')} />
            </div>
            <div>
              <Label>Адрес</Label>
              <Input
                type="text"
                placeholder="г. Москва, ул. Примерная, 1"
                {...register('address')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Широта</Label>
                <Input type="number" step="any" placeholder="55.7558" {...register('latitude')} />
              </div>
              <div>
                <Label>Долгота</Label>
                <Input type="number" step="any" placeholder="37.6173" {...register('longitude')} />
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
