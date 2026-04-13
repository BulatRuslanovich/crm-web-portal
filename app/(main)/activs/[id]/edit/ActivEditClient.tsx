'use client';

import { useState, useEffect, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { useApi } from '@/lib/use-api';
import { useSetDiff } from '@/lib/use-set-diff';
import { activsApi } from '@/lib/api/activs';
import { drugsApi } from '@/lib/api/drugs';
import { STATUSES } from '@/lib/api/statuses';
import { useAuth } from '@/lib/auth-context';
import { extractApiError } from '@/lib/api/errors';
import {
  BackButton,
  Card,
  CardFooter,
  CardSkeleton,
  Label,
  Textarea,
  ErrorBox,
  BtnPrimary,
  BtnSecondary,
} from '@/components/ui';
import { DateTimePicker } from '@/components/DateTimePicker';
import { Combobox } from '@/components/Combobox';
import { MultiCombobox } from '@/components/MultiCombobox';

interface FormValues {
  statusId: string;
  start: string;
  end: string;
  description: string;
}

export default function ActivEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.policies?.includes('Admin') ?? false;

  const [apiError, setApiError] = useState('');
  const numId = Number(id);

  const { data: activ, error: activError } = useApi(
    ['activ', numId],
    () => activsApi.getById(numId).then((r) => r.data),
  );

  useEffect(() => {
    if (activError) router.push('/activs');
  }, [activError, router]);

  const { data: allDrugs = [] } = useApi(
    'drugs-all',
    () => drugsApi.getAll(1, 200).then(({ data }) => data.items),
    { dedupingInterval: 300_000 },
  );

  const drugSourceIds = useMemo(
    () =>
      activ && allDrugs.length > 0
        ? allDrugs.filter((d) => activ.drugs.includes(d.drugName)).map((d) => d.drugId)
        : [],
    [activ, allDrugs],
  );
  const drugs = useSetDiff(drugSourceIds);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { statusId: '1', start: '', end: '', description: '' },
  });

  useEffect(() => {
    if (!activ) return;
    reset({
      statusId: String(activ.statusId),
      start: activ.start ? activ.start.slice(0, 16) : '',
      end: activ.end ? activ.end.slice(0, 16) : '',
      description: activ.description ?? '',
    });
  }, [activ, reset]);

  if (!activ)
    return (
      <div className="mx-auto max-w-2xl">
        <CardSkeleton />
      </div>
    );

  const statusOptions = STATUSES.map((s) => ({
    value: String(s.statusId),
    label: s.statusName,
  }));

  const drugOptions = allDrugs.map((d) => ({
    value: String(d.drugId),
    label: d.drugName,
    sublabel: d.brand || undefined,
  }));

  const selectedDrugIds = [...drugs.selected].map(String);

  function handleDrugChange(values: string[]) {
    const newSet = new Set(values.map(Number));
    const current = drugs.selected;
    for (const id of current) {
      if (!newSet.has(id)) drugs.remove(id);
    }
    for (const id of newSet) {
      if (!current.has(id)) drugs.add(id);
    }
  }

  async function onSubmit(values: FormValues) {
    setApiError('');
    try {
      await activsApi.update(numId, {
        statusId: isAdmin ? Number(values.statusId) : activ!.statusId,
        start: isAdmin ? values.start || null : activ!.start,
        end: isAdmin ? values.end || null : activ!.end,
        description: values.description || null,
      });

      const { toAdd, toRemove } = drugs.diff();
      await Promise.all([
        ...toAdd.map((did) => activsApi.addDrug(numId, did)),
        ...toRemove.map((did) => activsApi.removeDrug(numId, did)),
      ]);

      router.push(`/activs/${id}`);
    } catch (err) {
      setApiError(extractApiError(err, 'Ошибка обновления'));
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <BackButton onClick={() => router.push(`/activs/${id}`)} />
        <h2 className="min-w-0 flex-1 truncate text-xl font-semibold text-(--fg)">
          {activ.orgName}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <div className="space-y-4 p-5">
            {isAdmin && (
              <>
                <div>
                  <Label>Статус</Label>
                  <Controller
                    name="statusId"
                    control={control}
                    render={({ field }) => (
                      <Combobox
                        options={statusOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Выберите статус"
                      />
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Начало</Label>
                    <Controller
                      name="start"
                      control={control}
                      render={({ field }) => (
                        <DateTimePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Дата начала"
                        />
                      )}
                    />
                  </div>
                  <div>
                    <Label>Конец</Label>
                    <Controller
                      name="end"
                      control={control}
                      render={({ field }) => (
                        <DateTimePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Дата окончания"
                        />
                      )}
                    />
                  </div>
                </div>
                <hr className="border-(--border)" />
              </>
            )}

            <div>
              <Label>Описание</Label>
              <Textarea rows={3} placeholder="Описание визита..." {...register('description')} />
            </div>

            {allDrugs.length > 0 && (
              <div>
                <Label>Препараты</Label>
                <MultiCombobox
                  options={drugOptions}
                  value={selectedDrugIds}
                  onChange={handleDrugChange}
                  placeholder="Выберите препараты"
                  searchPlaceholder="Поиск препарата..."
                />
              </div>
            )}

            {apiError && <ErrorBox message={apiError} />}
          </div>

          <CardFooter>
            <BtnSecondary type="button" onClick={() => router.push(`/activs/${id}`)}>
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
