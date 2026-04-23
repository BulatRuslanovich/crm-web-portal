'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { CalendarCheck } from 'lucide-react';
import { activsApi } from '@/lib/api/activs';
import { toast } from 'sonner';
import {
  BtnSecondary,
  BtnSuccess,
  Card,
  CardFooter,
  ErrorBox,
} from '@/components/ui';
import type { ComboboxOption } from '@/components/Combobox';
import { FormPageHeader } from '../../_components/FormPageHeader';
import { useSubmitAction } from '../../_lib/use-submit-action';
import { type TargetKind } from '../_components/TargetSwitcher';
import { TargetField } from '../_components/TargetField';

import {
  CREATE_ACTIV_DEFAULT_VALUES,
  activFormToCreateRequest,
  buildTargetIds,
  type CreateActivFormValues,
} from '../_lib/activ-form';

import { useDrugPicker } from '@/app/(main)/activs/_lib/usr-drug-picker';
import { DrugsField } from '@/app/(main)/activs/_components/DrugsField';
import { DescriptionField } from '@/app/(main)/activs/_components/DescriptionField';
import { syncDrugs } from '@/app/(main)/activs/_lib/helper';
import { DateTimeField } from '@/app/(main)/activs/_components/DateTimeField';

export default function CreateActivPage() {
  const router = useRouter();
  const [targetKind, setTargetKind] = useState<TargetKind>('org');
  const [selectedOrg, setSelectedOrg] = useState<ComboboxOption | undefined>();
  const [selectedPhys, setSelectedPhys] = useState<ComboboxOption | undefined>();
  const submitAction = useSubmitAction({ fallbackError: 'Ошибка создания визита' });
  const drugPicker = useDrugPicker(undefined);

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
      <FormPageHeader icon={CalendarCheck} iconTone="primary" title="Новый визит" />

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

          <CardFooter>
            <BtnSecondary type="button" onClick={() => router.back()}>
              Отмена
            </BtnSecondary>
            <BtnSuccess type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Создание...' : 'Создать визит'}
            </BtnSuccess>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
