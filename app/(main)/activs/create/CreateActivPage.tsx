'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { activsApi } from '@/lib/api/activs';
import { searchOrgOptions } from '@/lib/api/orgs';
import { searchPhysOptions } from '@/lib/api/physes';
import { searchDrugOptions } from '@/lib/api/drugs';
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
  SectionLabel,
} from '@/components/ui';
import { DateTimePicker } from '@/components/DateTimePicker';
import { Combobox, type ComboboxOption } from '@/components/Combobox';
import { MultiCombobox, type MultiComboboxOption } from '@/components/MultiCombobox';
import { STATUS_PLANNED } from '@/lib/api/statuses';
import {
  Building2,
  Stethoscope,
  CalendarCheck,
  Target,
  Clock,
  FileText,
  Pill,
} from 'lucide-react';

type TargetKind = 'org' | 'phys';

interface FormValues {
  orgId: string;
  physId: string;
  start: string;
  description: string;
  drugIds: string[];
}

export default function CreateActivPage() {
  const router = useRouter();
  const [targetKind, setTargetKind] = useState<TargetKind>('org');
  const [selectedOrg, setSelectedOrg] = useState<ComboboxOption | undefined>();
  const [selectedPhys, setSelectedPhys] = useState<ComboboxOption | undefined>();
  const [selectedDrugs, setSelectedDrugs] = useState<MultiComboboxOption[]>([]);
  const [apiError, setApiError] = useState('');

  const {
    handleSubmit,
    control,
    register,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      orgId: '',
      physId: '',
      start: '',
      description: '',
      drugIds: [],
    },
  });

  function switchTarget(kind: TargetKind) {
    setTargetKind(kind);
    if (kind === 'org') {
      setValue('physId', '');
      setSelectedPhys(undefined);
    } else {
      setValue('orgId', '');
      setSelectedOrg(undefined);
    }
  }

  async function onSubmit(values: FormValues) {
    setApiError('');

    const orgId = targetKind === 'org' && values.orgId ? Number(values.orgId) : null;
    const physId = targetKind === 'phys' && values.physId ? Number(values.physId) : null;

    if ((orgId == null) === (physId == null)) {
      setApiError(targetKind === 'org' ? 'Выберите организацию' : 'Выберите врача');
      return;
    }

    try {
      const { data } = await activsApi.create({
        orgId,
        physId,
        statusId: STATUS_PLANNED,
        start: values.start,
        end: null,
        description: values.description,
        drugIds: values.drugIds.map(Number),
      });
      router.push(`/activs/${data.activId}`);
    } catch (err) {
      setApiError(extractApiError(err, 'Ошибка создания визита'));
    }
  }

  return (
    <div className="mx-auto w-full space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <BackButton />
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
            <CalendarCheck size={16} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Новый визит</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <div className="space-y-6 p-5">
            {/* Target */}
            <div>
              <SectionLabel icon={Target}>Цель визита</SectionLabel>
              <div className="mb-3 grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/50 p-1">
                <button
                  type="button"
                  onClick={() => switchTarget('org')}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    targetKind === 'org'
                      ? 'bg-card text-foreground shadow-sm ring-1 ring-border'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Building2 size={15} /> Организация
                </button>
                <button
                  type="button"
                  onClick={() => switchTarget('phys')}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    targetKind === 'phys'
                      ? 'bg-card text-foreground shadow-sm ring-1 ring-border'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Stethoscope size={15} /> Врач
                </button>
              </div>

              {targetKind === 'org' ? (
                <div>
                  <Label required>Организация</Label>
                  <Controller
                    name="orgId"
                    control={control}
                    rules={{ required: targetKind === 'org' }}
                    render={({ field }) => (
                      <Combobox
                        asyncSearch={searchOrgOptions}
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
              ) : (
                <div>
                  <Label required>Врач</Label>
                  <Controller
                    name="physId"
                    control={control}
                    rules={{ required: targetKind === 'phys' }}
                    render={({ field }) => (
                      <Combobox
                        asyncSearch={searchPhysOptions}
                        selectedOption={selectedPhys}
                        value={field.value}
                        onChange={(val, opt) => {
                          field.onChange(val);
                          setSelectedPhys(opt);
                        }}
                        placeholder="Выберите врача"
                        searchPlaceholder="Поиск врача..."
                      />
                    )}
                  />
                </div>
              )}
            </div>

            <hr className="border-border" />

            {/* Time */}
            <div>
              <SectionLabel icon={Clock}>Время</SectionLabel>
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

            <hr className="border-border" />

            {/* Description */}
            <div>
              <SectionLabel icon={FileText}>Описание</SectionLabel>
              <Textarea rows={3} placeholder="Описание визита..." {...register('description')} />
            </div>

            <hr className="border-border" />

            {/* Drugs */}
            <div>
              <SectionLabel icon={Pill}>Препараты</SectionLabel>
              <Controller
                name="drugIds"
                control={control}
                render={({ field }) => (
                  <MultiCombobox
                    asyncSearch={searchDrugOptions}
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
