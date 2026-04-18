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
  SectionLabel,
} from '@/components/ui';
import { Combobox } from '@/components/Combobox';
import { Building2, FileText, MapPin, Plus } from 'lucide-react';

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
    <div className="mx-auto w-full space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <BackButton />
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/10 ring-1 ring-success/20">
            <Plus size={16} className="text-success" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Новая организация</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <div className="space-y-6 p-5">
            <div>
              <SectionLabel icon={Building2}>Основная информация</SectionLabel>
              <div className="space-y-4">
                <div>
                  <Label required>Название</Label>
                  <Input
                    type="text"
                    placeholder="Городская больница №1"
                    {...register('orgName')}
                  />
                </div>
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
              </div>
            </div>

            <hr className="border-border" />

            <div>
              <SectionLabel icon={FileText}>Реквизиты</SectionLabel>
              <div>
                <Label>ИНН</Label>
                <Input type="text" placeholder="0000000000" {...register('inn')} />
              </div>
            </div>

            <hr className="border-border" />

            <div>
              <SectionLabel icon={MapPin}>Местоположение</SectionLabel>
              <div className="space-y-4">
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
                    <Input
                      type="number"
                      step="any"
                      placeholder="55.7558"
                      {...register('latitude')}
                    />
                  </div>
                  <div>
                    <Label>Долгота</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="37.6173"
                      {...register('longitude')}
                    />
                  </div>
                </div>
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
