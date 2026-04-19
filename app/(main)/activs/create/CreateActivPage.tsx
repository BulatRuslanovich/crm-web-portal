'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { CalendarCheck } from 'lucide-react';
import { activsApi } from '@/lib/api/activs';
import { extractApiError } from '@/lib/api/errors';
import { toast } from 'sonner';
import { STATUS_PLANNED } from '@/lib/api/statuses';
import {
  BtnSecondary,
  BtnSuccess,
  Card,
  CardFooter,
  ErrorBox,
} from '@/components/ui';
import type { ComboboxOption } from '@/components/Combobox';
import type { MultiComboboxOption } from '@/components/MultiCombobox';
import { FormPageHeader } from '../../_components/FormPageHeader';
import { type TargetKind } from '../_components/TargetSwitcher';
import { TargetSection } from './_components/TargetSection';
import {
  DescriptionSection,
  DrugsSection,
  TimeSection,
} from './_components/ActivFormSections';

interface FormValues {
  orgId: string;
  physId: string;
  start: string;
  description: string;
  drugIds: string[];
}

const DEFAULT_VALUES: FormValues = {
  orgId: '',
  physId: '',
  start: '',
  description: '',
  drugIds: [],
};

export default function CreateActivPage() {
  const router = useRouter();
  const [targetKind, setTargetKind] = useState<TargetKind>('org');
  const [selectedOrg, setSelectedOrg] = useState<ComboboxOption | undefined>();
  const [selectedPhys, setSelectedPhys] = useState<ComboboxOption | undefined>();
  const [selectedDrugs, setSelectedDrugs] = useState<MultiComboboxOption[]>([]);
  const [apiError, setApiError] = useState('');

  const form = useForm<FormValues>({ defaultValues: DEFAULT_VALUES });

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

  async function onSubmit(values: FormValues) {
    setApiError('');
    const ids = buildTargetIds(values, targetKind);
    if (ids.error) {
      setApiError(ids.error);
      return;
    }

    try {
      const { data } = await activsApi.create({
        orgId: ids.orgId,
        physId: ids.physId,
        statusId: STATUS_PLANNED,
        start: values.start,
        end: null,
        description: values.description,
        drugIds: values.drugIds.map(Number),
      });
      toast.success('Визит создан', {
        description: targetKind === 'org' ? selectedOrg?.label : selectedPhys?.label,
      });
      router.push(`/activs/${data.activId}`);
    } catch (err) {
      setApiError(extractApiError(err, 'Ошибка создания визита'));
    }
  }

  return (
    <div className="mx-auto w-full space-y-4">
      <FormPageHeader icon={CalendarCheck} iconTone="primary" title="Новый визит" />

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <div className="space-y-6 p-5">
            <TargetSection
              control={form.control}
              targetKind={targetKind}
              onSwitch={switchTarget}
              selectedOrg={selectedOrg}
              selectedPhys={selectedPhys}
              onPickOrg={setSelectedOrg}
              onPickPhys={setSelectedPhys}
            />

            <hr className="border-border" />

            <TimeSection control={form.control} />

            <hr className="border-border" />

            <DescriptionSection register={form.register} />

            <hr className="border-border" />

            <DrugsSection
              control={form.control}
              selected={selectedDrugs}
              onSelectedChange={setSelectedDrugs}
            />

            {apiError && <ErrorBox message={apiError} />}
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

interface TargetIds {
  orgId: number | null;
  physId: number | null;
  error?: string;
}

function buildTargetIds(values: FormValues, kind: TargetKind): TargetIds {
  const orgId = kind === 'org' && values.orgId ? Number(values.orgId) : null;
  const physId = kind === 'phys' && values.physId ? Number(values.physId) : null;

  if ((orgId == null) === (physId == null)) {
    return {
      orgId,
      physId,
      error: kind === 'org' ? 'Выберите организацию' : 'Выберите врача',
    };
  }
  return { orgId, physId };
}
