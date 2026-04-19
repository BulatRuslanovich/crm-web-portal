'use client';

import { useEffect, useMemo, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Building2, Pencil, Stethoscope } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useApi } from '@/lib/hooks/use-api';
import { activsApi } from '@/lib/api/activs';
import { useRoles } from '@/lib/hooks/use-roles';
import { extractApiError } from '@/lib/api/errors';
import { toast } from 'sonner';
import { useMultiPicker } from '@/lib/hooks/use-multi-picker';
import type { ActivResponse } from '@/lib/api/types';
import {
  BtnPrimary,
  BtnSecondary,
  Card,
  CardFooter,
  CardSkeleton,
  ErrorBox,
  StatusBadge,
} from '@/components/ui';
import { FormPageHeader } from '../../../_components/FormPageHeader';
import {
  DescriptionField,
  DrugsField,
  StatusField,
  TimeFields,
} from './_components/ActivEditSections';

interface FormValues {
  statusId: string;
  start: string;
  end: string;
  description: string;
}

const DEFAULT_VALUES: FormValues = { statusId: '1', start: '', end: '', description: '' };

export default function ActivEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { canManageActivs: canEditFields } = useRoles();
  const numId = Number(id);

  const [apiError, setApiError] = useState('');
  const activ = useLoadedActiv(numId);
  const drugPicker = useDrugPicker(activ);
  const form = useForm<FormValues>({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (!activ) return;
    form.reset(activToFormValues(activ));
  }, [activ, form]);

  if (!activ) {
    return (
      <div className="mx-auto w-full">
        <CardSkeleton />
      </div>
    );
  }

  async function onSubmit(values: FormValues) {
    setApiError('');
    try {
      await updateActiv(numId, activ!, values, canEditFields);
      await syncDrugs(numId, drugPicker.diff());
      toast.success('Изменения сохранены');
      router.push(`/activs/${id}`);
    } catch (err) {
      setApiError(extractApiError(err, 'Ошибка обновления'));
    }
  }

  return (
    <div className="mx-auto w-full space-y-4">
      <EditHeader activ={activ} backHref={`/activs/${id}`} />

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <div className="space-y-6 p-5">
            {canEditFields && (
              <>
                <StatusField control={form.control} />
                <hr className="border-border" />
                <TimeFields control={form.control} />
                <hr className="border-border" />
              </>
            )}
            <DescriptionField register={form.register} />
            <hr className="border-border" />
            <DrugsField picker={drugPicker} />

            {apiError && <ErrorBox message={apiError} />}
          </div>

          <CardFooter>
            <BtnSecondary type="button" onClick={() => router.push(`/activs/${id}`)}>
              Отмена
            </BtnSecondary>
            <BtnPrimary type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </BtnPrimary>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

function useLoadedActiv(numId: number): ActivResponse | undefined {
  const router = useRouter();
  const { data, error } = useApi(['activ', numId], () =>
    activsApi.getById(numId).then((r) => r.data),
  );

  useEffect(() => {
    if (error) router.push('/activs');
  }, [error, router]);

  return data;
}

function useDrugPicker(activ: ActivResponse | undefined) {
  return useMultiPicker(
    useMemo(
      () =>
        activ
          ? activ.drugs.map((d) => ({
              id: d.drugId,
              option: {
                value: String(d.drugId),
                label: d.drugName,
                sublabel: d.brand || undefined,
              },
            }))
          : [],
      [activ],
    ),
  );
}

function EditHeader({ activ, backHref }: { activ: ActivResponse; backHref: string }) {
  const isPhys = activ.physId != null;
  const TargetIcon: LucideIcon = isPhys ? Stethoscope : Building2;
  const targetName = (isPhys ? activ.physName : activ.orgName) ?? '—';

  return (
    <FormPageHeader
      backHref={backHref}
      icon={Pencil}
      iconTone="primary"
      kicker="Редактирование визита"
      title={targetName}
      subtitleIcon={TargetIcon}
      trailing={<StatusBadge name={activ.statusName} />}
    />
  );
}

function activToFormValues(activ: ActivResponse): FormValues {
  return {
    statusId: String(activ.statusId),
    start: activ.start ? activ.start.slice(0, 16) : '',
    end: activ.end ? activ.end.slice(0, 16) : '',
    description: activ.description ?? '',
  };
}

async function updateActiv(
  numId: number,
  activ: ActivResponse,
  values: FormValues,
  canEditFields: boolean,
) {
  await activsApi.update(numId, {
    statusId: canEditFields ? Number(values.statusId) : activ.statusId,
    start: canEditFields ? values.start || null : activ.start,
    end: canEditFields ? values.end || null : activ.end,
    description: values.description || null,
  });
}

async function syncDrugs(
  numId: number,
  diff: { toAdd: number[]; toRemove: number[] },
) {
  await Promise.all([
    ...diff.toAdd.map((did) => activsApi.addDrug(numId, did)),
    ...diff.toRemove.map((did) => activsApi.removeDrug(numId, did)),
  ]);
}
