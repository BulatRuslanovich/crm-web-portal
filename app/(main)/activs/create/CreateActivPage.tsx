'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { CalendarCheck } from 'lucide-react';
import { activsApi } from '@/lib/api/activs';
import { toast } from 'sonner';
import { Card, ErrorBox } from '@/components/ui';
import type { ComboboxOption } from '@/components/Combobox';
import { PageHeader } from '@/components/PageHeader';
import { FormCardFooter } from '@/components/FormCardFooter';
import { useSubmitAction } from '@/lib/use-submit-action';
import { type TargetKind } from '@/components/TargetSwitcher';
import { TargetField } from '@/components/TargetField';
import { DrugsField } from '@/components/DrugsField';
import { DescriptionField } from '@/components/DescriptionField';
import { DateTimeField } from '@/components/DateTimeField';
import { useMultiPicker } from '@/lib/hooks/use-multi-picker';
import { syncDrugs } from '@/lib/activ-helper';
import {
  CREATE_ACTIV_DEFAULT_VALUES,
  activFormToCreateRequest,
  buildTargetIds,
  type CreateActivFormValues,
} from '@/lib/activ-form';

export default function CreateActivPage() {
  const router = useRouter();
  const [targetKind, setTargetKind] = useState<TargetKind>('org');
  const [selectedOrg, setSelectedOrg] = useState<ComboboxOption | undefined>();
  const [selectedPhys, setSelectedPhys] = useState<ComboboxOption | undefined>();
  const submitAction = useSubmitAction({ fallbackError: 'Ошибка создания визита' });
  const drugPicker = useMultiPicker([]);

  const form = useForm<CreateActivFormValues>({ defaultValues: CREATE_ACTIV_DEFAULT_VALUES });

  function switchTarget(kind: TargetKind) {
    setTargetKind(kind);
    if (kind === 'org') {
      form.setValue('physId', '');
      setSelectedPhys(undefined);
    } else {
      form.setValue('orgId', '');
      setSelectedOrg(undefined);
    }
  }

  async function onSubmit(values: CreateActivFormValues) {
    submitAction.setError('');
    const id = buildTargetIds(values, targetKind);
    if (id.error) {
      submitAction.setError(id.error);
      return;
    }

    await submitAction.submit(async () => {
      const { data } = await activsApi.create(activFormToCreateRequest(values, id));
      await syncDrugs(data.activId, drugPicker.diff());
      toast.success('Визит создан', {
        description: targetKind === 'org' ? selectedOrg?.label : selectedPhys?.label,
      });
      router.push(`/activs/${data.activId}`);
    });
  }

  return (
    <div className="mx-auto w-full space-y-4">
      <PageHeader icon={CalendarCheck} iconTone="primary" title="Новый визит" />

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <div className="space-y-6 p-5">
            <TargetField
              control={form.control}
              targetKind={targetKind}
              onSwitch={switchTarget}
              selectedOrg={selectedOrg}
              selectedPhys={selectedPhys}
              onPickOrg={setSelectedOrg}
              onPickPhys={setSelectedPhys}
            />

            <hr className="border-border" />

            <DateTimeField
              name="start"
              label="Дата начала"
              placeholder="Выберите дату и время"
              control={form.control}
            />

            <hr className="border-border" />

            <DescriptionField control={form.control} />

            <hr className="border-border" />

            <DrugsField picker={drugPicker} />

            {submitAction.error && <ErrorBox message={submitAction.error} />}
          </div>

          <FormCardFooter
            onCancel={() => router.back()}
            isSubmitting={form.formState.isSubmitting}
            label="Создать визит"
            variant="create"
          />
        </Card>
      </form>
    </div>
  );
}
