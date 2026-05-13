'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useApi } from '@/lib/hooks/use-api';
import { activsApi } from '@/lib/api/activs';
import { useRoles } from '@/lib/hooks/use-roles';
import { toast } from 'sonner';
import type { ActivResponse } from '@/lib/api/types';
import { Card, CardSkeleton, ErrorBox, SectionLabel, StatusBadge } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { FormCardFooter } from '@/components/FormCardFooter';
import { useSubmitAction } from '@/lib/use-submit-action';
import { DescriptionField } from '@/components/DescriptionField';
import { DrugsField } from '@/components/DrugsField';
import { DateTimeField } from '@/components/DateTimeField';
import { StatusField } from '@/components/StatusField';
import { useMultiPicker } from '@/lib/hooks/use-multi-picker';
import { useMemo } from 'react';
import { syncDrugs } from '@/lib/activ-helper';
import {
  EDIT_ACTIV_DEFAULT_VALUES,
  activFormToUpdateRequest,
  activToFormValues,
  type EditActivFormValues,
} from '@/lib/activ-form';

export default function EditActivPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { canManageActivs: canEditFields } = useRoles();
  const numId = Number(id);

  const submitAction = useSubmitAction({ fallbackError: 'Ошибка обновления' });
  const activ = useLoadedActiv(numId);
  const drugPicker = useMultiPicker(
    useMemo(
      () =>
        activ
          ? activ.drugs.map((d) => ({
              id: d.drugId,
              option: { value: String(d.drugId), label: d.drugName, sublabel: d.brand },
            }))
          : [],
      [activ],
    ),
  );
  const form = useForm<EditActivFormValues>({ defaultValues: EDIT_ACTIV_DEFAULT_VALUES });

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

  async function onSubmit(values: EditActivFormValues) {
    await submitAction.submit(async () => {
      await updateActiv(numId, activ!, values, canEditFields);
      await syncDrugs(numId, drugPicker.diff());
      toast.success('Изменения сохранены');
      router.push(`/activs/${id}`);
    });
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

                <div>
                  <SectionLabel>Время визита</SectionLabel>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <DateTimeField
                      name="start"
                      label="Начало"
                      placeholder="Дата начала"
                      control={form.control}
                    />
                    <DateTimeField
                      name="end"
                      label="Конец"
                      placeholder="Дата окончания"
                      control={form.control}
                    />
                  </div>
                </div>
                <hr className="border-border" />
              </>
            )}
            <DescriptionField control={form.control} />
            <hr className="border-border" />
            <DrugsField picker={drugPicker} />

            {submitAction.error && <ErrorBox message={submitAction.error} />}
          </div>

          <FormCardFooter
            onCancel={() => router.push(`/activs/${id}`)}
            isSubmitting={form.formState.isSubmitting}
            label="Сохранить"
          />
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

function EditHeader({ activ, backHref }: { activ: ActivResponse; backHref: string }) {
  const isPhys = activ.physId != null;
  const targetName = (isPhys ? activ.physName : activ.orgName) ?? '—';

  return (
    <PageHeader
      backHref={backHref}
      kicker="Редактирование визита"
      title={targetName}
      action={<StatusBadge name={activ.statusName} statusId={activ.statusId} />}
    />
  );
}

async function updateActiv(
  numId: number,
  activ: ActivResponse,
  values: EditActivFormValues,
  canEditFields: boolean,
) {
  await activsApi.update(numId, activFormToUpdateRequest(activ, values, canEditFields));
}
