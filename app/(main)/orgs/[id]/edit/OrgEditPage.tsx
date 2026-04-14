'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { useApi } from '@/lib/use-api';
import { useEntity } from '@/lib/use-entity';
import { orgsApi } from '@/lib/api/orgs';
import { extractApiError } from '@/lib/api/errors';
import {
  BackButton,
  Card,
  CardFooter,
  CardSkeleton,
  Label,
  Input,
  ErrorBox,
  BtnPrimary,
  BtnSecondary,
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

export default function OrgEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [apiError, setApiError] = useState('');

  const numId = Number(id);
  const { data: org } = useEntity(['org', numId], () => orgsApi.getById(numId), '/orgs');

  const { data: types = [] } = useApi(
    'org-types',
    () => orgsApi.getTypes().then(({ data }) => data),
    { dedupingInterval: 300_000 },
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { orgTypeId: '', orgName: '', inn: '', address: '', latitude: '', longitude: '' },
  });

  useEffect(() => {
    if (!org) return;
    reset({
      orgTypeId: String(org.orgTypeId),
      orgName: org.orgName,
      inn: org.inn ?? '',
      address: org.address ?? '',
      latitude: org.latitude != null ? String(org.latitude) : '',
      longitude: org.longitude != null ? String(org.longitude) : '',
    });
  }, [org, reset]);

  if (!org)
    return (
      <div className="mx-auto max-w-2xl">
        <CardSkeleton />
      </div>
    );

  const typeOptions = types.map((t) => ({
    value: String(t.orgTypeId),
    label: t.orgTypeName,
  }));

  async function onSubmit(values: FormValues) {
    setApiError('');
    try {
      await orgsApi.update(numId, {
        orgTypeId: Number(values.orgTypeId),
        orgName: values.orgName,
        inn: values.inn || null,
        address: values.address || null,
        latitude: values.latitude ? Number(values.latitude) : null,
        longitude: values.longitude ? Number(values.longitude) : null,
      });
      router.push(`/orgs/${id}`);
    } catch (err) {
      setApiError(extractApiError(err, 'Неизвестная ошибка при обновлении организации'));
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <BackButton href={`/orgs/${id}`} />
        <h2 className="flex-1 text-xl font-semibold text-(--fg)">{org.orgName}</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <div className="space-y-4 p-5">
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
            <div>
              <Label required>Название</Label>
              <Input type="text" {...register('orgName')} />
            </div>
            <div>
              <Label>ИНН</Label>
              <Input type="text" {...register('inn')} />
            </div>
            <div>
              <Label>Адрес</Label>
              <Input type="text" {...register('address')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Широта</Label>
                <Input type="number" step="any" {...register('latitude')} />
              </div>
              <div>
                <Label>Долгота</Label>
                <Input type="number" step="any" {...register('longitude')} />
              </div>
            </div>
            {apiError && <ErrorBox message={apiError} />}
          </div>
          <CardFooter>
            <BtnSecondary type="button" onClick={() => router.push(`/orgs/${id}`)}>
              Отмена
            </BtnSecondary>
            <BtnPrimary type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </BtnPrimary>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
