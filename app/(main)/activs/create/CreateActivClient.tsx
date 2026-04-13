'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { useApi } from '@/lib/use-api';
import { activsApi } from '@/lib/api/activs';
import { orgsApi } from '@/lib/api/orgs';
import { drugsApi } from '@/lib/api/drugs';
import { extractApiError } from '@/lib/api/errors';
import {
  BackButton,
  Card,
  CardFooter,
  Label,
  Textarea,
  ErrorBox,
  BtnSecondary,
  BtnSuccess,
} from '@/components/ui';
import { DateTimePicker } from '@/components/DateTimePicker';
import { Combobox } from '@/components/Combobox';
import { MultiCombobox } from '@/components/MultiCombobox';
import { STATUS_PLANNED } from '@/lib/api/statuses';

interface FormValues {
  orgId: string;
  start: string;
  description: string;
  drugIds: string[];
}

export default function CreateActivPage() {
  const router = useRouter();
  const { data: refData, loading: loadingData } = useApi(() =>
    Promise.all([orgsApi.getAll(), drugsApi.getAll()]).then(([o, d]) => ({
      orgs: o.data.items,
      drugs: d.data.items,
    })),
  );
  const orgs = refData?.orgs ?? [];
  const drugs = refData?.drugs ?? [];

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { orgId: '', start: '', description: '', drugIds: [] },
  });

  const [apiError, setApiError] = useState('');

  const orgOptions = orgs.map((o) => ({
    value: String(o.orgId),
    label: o.orgName,
  }));

  const drugOptions = drugs.map((d) => ({
    value: String(d.drugId),
    label: d.drugName,
    sublabel: d.brand || undefined,
  }));

  async function onSubmit(values: FormValues) {
    setApiError('');
    try {
      const { data } = await activsApi.create({
        orgId: Number(values.orgId),
        statusId: STATUS_PLANNED,
        start: values.start || null,
        end: null,
        description: values.description || null,
        drugIds: values.drugIds.map(Number),
      });
      router.push(`/activs/${data.activId}`);
    } catch (err) {
      setApiError(extractApiError(err, 'Ошибка создания визита'));
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center gap-3">
        <BackButton onClick={() => router.back()} />
        <h2 className="text-xl font-semibold text-(--fg)">Новый визит</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <div className="space-y-4 p-4">
            {/* Организация */}
            <div>
              <Label required>Организация</Label>
              {loadingData ? (
                <div className="h-10 animate-pulse rounded-xl border border-(--border) bg-(--surface-raised)" />
              ) : (
                <Controller
                  name="orgId"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Combobox
                      options={orgOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Выберите организацию"
                      searchPlaceholder="Поиск организации..."
                    />
                  )}
                />
              )}
            </div>

            {/* Дата начала */}
            <div>
              <Label>Дата начала</Label>
              <Controller
                name="start"
                control={control}
                render={({ field }) => (
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Выберите дату и время"
                  />
                )}
              />
            </div>

            {/* Описание */}
            <div>
              <Label>Описание</Label>
              <Textarea rows={3} placeholder="Описание визита..." {...register('description')} />
            </div>

            {/* Препараты */}
            {drugs.length > 0 && (
              <div>
                <Label>Препараты</Label>
                <Controller
                  name="drugIds"
                  control={control}
                  render={({ field }) => (
                    <MultiCombobox
                      options={drugOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Выберите препараты"
                      searchPlaceholder="Поиск препарата..."
                    />
                  )}
                />
              </div>
            )}

            {apiError && <ErrorBox message={apiError} />}
          </div>

          <CardFooter>
            <BtnSecondary type="button" onClick={() => router.back()}>
              Отмена
            </BtnSecondary>
            <BtnSuccess type="submit" disabled={isSubmitting || loadingData}>
              {isSubmitting ? 'Создание...' : 'Создать визит'}
            </BtnSuccess>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
