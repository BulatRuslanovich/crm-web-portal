'use client';

import { useState, useEffect, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { useApi } from '@/lib/use-api';
import { useSetDiff } from '@/lib/use-set-diff';
import { activsApi } from '@/lib/api/activs';
import { searchDrugOptions } from '@/lib/api/drugs';
import { STATUSES } from '@/lib/api/statuses';
import { useRoles } from '@/lib/use-roles';
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
  SectionLabel,
  StatusBadge,
} from '@/components/ui';
import { DateTimePicker } from '@/components/DateTimePicker';
import { Combobox } from '@/components/Combobox';
import { MultiCombobox, type MultiComboboxOption } from '@/components/MultiCombobox';
import { Pencil, Clock, FileText, Pill, CircleDot, Building2, Stethoscope } from 'lucide-react';

interface FormValues {
  statusId: string;
  start: string;
  end: string;
  description: string;
}

export default function ActivEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { canManageActivs } = useRoles();
  const canEditFields = canManageActivs;

  const [apiError, setApiError] = useState('');
  const [pickedDrugs, setPickedDrugs] = useState<MultiComboboxOption[]>([]);
  const numId = Number(id);

  const { data: activ, error: activError } = useApi(['activ', numId], () =>
    activsApi.getById(numId).then((r) => r.data),
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
      <div className="mx-auto w-full">
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
        statusId: canEditFields ? Number(values.statusId) : activ!.statusId,
        start: canEditFields ? values.start || null : activ!.start,
        end: canEditFields ? values.end || null : activ!.end,
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

  const isPhys = activ.physId != null;
  const TargetIcon = isPhys ? Stethoscope : Building2;
  const targetName = isPhys ? activ.physName : activ.orgName;

  return (
    <div className="mx-auto w-full space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <BackButton href={`/activs/${id}`} />
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
            <Pencil size={15} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Редактирование визита
            </p>
            <h2 className="flex min-w-0 items-center gap-1.5 truncate text-lg font-bold text-foreground">
              <TargetIcon size={15} className="shrink-0 text-muted-foreground" />
              <span className="truncate">{targetName ?? '—'}</span>
            </h2>
          </div>
        </div>
        <StatusBadge name={activ.statusName} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <div className="space-y-6 p-5">
            {canEditFields && (
              <>
                <div>
                  <SectionLabel icon={CircleDot}>Статус</SectionLabel>
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

                <hr className="border-border" />

                <div>
                  <SectionLabel icon={Clock}>Время визита</SectionLabel>
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
                </div>

                <hr className="border-border" />
              </>
            )}

            <div>
              <SectionLabel icon={FileText}>Описание</SectionLabel>
              <Textarea rows={3} placeholder="Описание визита..." {...register('description')} />
            </div>

            <hr className="border-border" />

            <div>
              <SectionLabel icon={Pill}>Препараты</SectionLabel>
              <MultiCombobox
                asyncSearch={searchDrugOptions}
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
