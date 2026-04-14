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
import { MultiCombobox, type MultiComboboxOption } from '@/components/MultiCombobox';

interface FormValues {
  statusId: string;
  start: string;
  end: string;
  description: string;
}

async function searchDrugs(query: string): Promise<MultiComboboxOption[]> {
  const { data } = await drugsApi.getAll(1, 20, query || undefined);
  return data.items.map((d) => ({
    value: String(d.drugId),
    label: d.drugName,
    sublabel: d.brand || undefined,
  }));
}

export default function ActivEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.policies?.includes('Admin') ?? false;

  const [apiError, setApiError] = useState('');
  const [pickedDrugs, setPickedDrugs] = useState<MultiComboboxOption[]>([]);
  const numId = Number(id);

  const { data: activ, error: activError } = useApi(
    ['activ', numId],
    () => activsApi.getById(numId).then((r) => r.data),
  );

  useEffect(() => {
    if (activError) router.push('/activs');
  }, [activError, router]);

  const drugs = useSetDiff(activ ? activ.drugs.map((d) => d.drugId) : []);

  const selectedDrugs = useMemo<MultiComboboxOption[]>(() => {
    const pool = new Map<string, MultiComboboxOption>();
    if (activ) {
      for (const d of activ.drugs) {
        pool.set(String(d.drugId), {
          value: String(d.drugId),
          label: d.drugName,
          sublabel: d.brand || undefined,
        });
      }
    }
    for (const o of pickedDrugs) pool.set(o.value, o);
    return [...drugs.selected]
      .map((id) => pool.get(String(id)))
      .filter((o): o is MultiComboboxOption => !!o);
  }, [activ, pickedDrugs, drugs.selected]);

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

  const selectedDrugIds = [...drugs.selected].map(String);

  function handleDrugChange(values: string[], opts?: MultiComboboxOption[]) {
    const newSet = new Set(values.map(Number));
    const current = drugs.selected;
    for (const id of current) {
      if (!newSet.has(id)) drugs.remove(id);
    }
    for (const id of newSet) {
      if (!current.has(id)) drugs.add(id);
    }
    if (opts) setPickedDrugs(opts);
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

            <div>
              <Label>Препараты</Label>
              <MultiCombobox
                asyncSearch={searchDrugs}
                selectedOptions={selectedDrugs}
                value={selectedDrugIds}
                onChange={handleDrugChange}
                placeholder="Выберите препараты"
                searchPlaceholder="Поиск препарата..."
              />
            </div>

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
