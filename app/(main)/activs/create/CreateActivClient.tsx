'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
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
import { Combobox, type ComboboxOption } from '@/components/Combobox';
import { MultiCombobox, type MultiComboboxOption } from '@/components/MultiCombobox';
import { STATUS_PLANNED } from '@/lib/api/statuses';

interface FormValues {
  orgId: string;
  start: string;
  description: string;
  drugIds: string[];
}

async function searchOrgs(query: string): Promise<ComboboxOption[]> {
  const { data } = await orgsApi.getAll(1, 20, query || undefined);
  return data.items.map((o) => ({ value: String(o.orgId), label: o.orgName }));
}

async function searchDrugs(query: string): Promise<MultiComboboxOption[]> {
  const { data } = await drugsApi.getAll(1, 20, query || undefined);
  return data.items.map((d) => ({
    value: String(d.drugId),
    label: d.drugName,
    sublabel: d.brand || undefined,
  }));
}

export default function CreateActivPage() {
  const router = useRouter();
  const [selectedOrg, setSelectedOrg] = useState<ComboboxOption | undefined>();
  const [selectedDrugs, setSelectedDrugs] = useState<MultiComboboxOption[]>([]);
  const [apiError, setApiError] = useState('');

  const {
    handleSubmit,
    control,
    register,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { orgId: '', start: '', description: '', drugIds: [] },
  });

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
            <div>
              <Label required>Организация</Label>
              <Controller
                name="orgId"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Combobox
                    asyncSearch={searchOrgs}
                    selectedOption={selectedOrg}
                    value={field.value}
                    onChange={(val, opt) => {
                      field.onChange(val);
                      setSelectedOrg(opt);
                    }}
                    placeholder="Выберите организацию"
                    searchPlaceholder="Поиск организации..."
                  />
                )}
              />
            </div>

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

            <div>
              <Label>Описание</Label>
              <Textarea rows={3} placeholder="Описание визита..." {...register('description')} />
            </div>

            <div>
              <Label>Препараты</Label>
              <Controller
                name="drugIds"
                control={control}
                render={({ field }) => (
                  <MultiCombobox
                    asyncSearch={searchDrugs}
                    selectedOptions={selectedDrugs}
                    value={field.value}
                    onChange={(vals, opts) => {
                      field.onChange(vals);
                      if (opts) setSelectedDrugs(opts);
                    }}
                    placeholder="Выберите препараты"
                    searchPlaceholder="Поиск препарата..."
                  />
                )}
              />
            </div>

            {apiError && <ErrorBox message={apiError} />}
          </div>

          <CardFooter>
            <BtnSecondary type="button" onClick={() => router.back()}>
              Отмена
            </BtnSecondary>
            <BtnSuccess type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Создание...' : 'Создать визит'}
            </BtnSuccess>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
