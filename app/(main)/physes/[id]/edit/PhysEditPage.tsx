'use client';

import { useState, useEffect, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { useApi } from '@/lib/use-api';
import { useSetDiff } from '@/lib/use-set-diff';
import { physesApi } from '@/lib/api/physes';
import { searchOrgOptions } from '@/lib/api/orgs';
import { specsApi } from '@/lib/api/specs';
import { extractApiError } from '@/lib/api/errors';
import {
  BackButton,
  Card,
  CardFooter,
  CardSkeleton,
  Label,
  Input,
  ErrorBox,
  BtnPrimary,
  BtnSecondary,
  SectionLabel,
} from '@/components/ui';
import { Combobox } from '@/components/Combobox';
import { MultiCombobox, type MultiComboboxOption } from '@/components/MultiCombobox';
import {
  Pencil,
  User,
  BriefcaseMedical,
  Phone,
  Building2,
  Stethoscope,
} from 'lucide-react';

interface FormValues {
  specId: string;
  lastName: string;
  firstName: string;
  middleName: string;
  phone: string;
  email: string;
  position: string;
}

export default function PhysEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [apiError, setApiError] = useState('');
  const [pickedOrgs, setPickedOrgs] = useState<MultiComboboxOption[]>([]);

  const numId = Number(id);
  const { data: phys, error: physError } = useApi(['phys', numId], () =>
    physesApi.getById(numId).then((r) => r.data),
  );

  useEffect(() => {
    if (physError) router.push('/physes');
  }, [physError, router]);

  const { data: specs = [] } = useApi(
    'specs',
    () => specsApi.getAll().then(({ data }) => data),
    { dedupingInterval: 300_000 },
  );

  const orgs = useSetDiff(phys ? phys.orgs.map((o) => o.orgId) : []);

  const selectedOrgs = useMemo<MultiComboboxOption[]>(() => {
    const pool = new Map<string, MultiComboboxOption>();
    if (phys) {
      for (const o of phys.orgs) {
        pool.set(String(o.orgId), { value: String(o.orgId), label: o.orgName });
      }
    }
    for (const o of pickedOrgs) pool.set(o.value, o);
    return [...orgs.selected]
      .map((id) => pool.get(String(id)))
      .filter((o): o is MultiComboboxOption => !!o);
  }, [phys, pickedOrgs, orgs.selected]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      specId: '',
      lastName: '',
      firstName: '',
      middleName: '',
      phone: '',
      email: '',
      position: '',
    },
  });

  useEffect(() => {
    if (!phys) return;
    reset({
      specId: phys.specId != null ? String(phys.specId) : '',
      lastName: phys.lastName,
      firstName: phys.firstName ?? '',
      middleName: phys.middleName ?? '',
      phone: phys.phone ?? '',
      email: phys.email ?? '',
    });
  }, [phys, reset]);

  if (!phys)
    return (
      <div className="mx-auto w-full">
        <CardSkeleton />
      </div>
    );

  const fullName = [phys.lastName, phys.firstName, phys.middleName].filter(Boolean).join(' ');

  const specOptions = specs.map((s) => ({
    value: String(s.specId),
    label: s.specName,
  }));

  const selectedOrgIds = [...orgs.selected].map(String);

  function handleOrgChange(values: string[], opts?: MultiComboboxOption[]) {
    const newSet = new Set(values.map(Number));
    const current = orgs.selected;
    for (const id of current) {
      if (!newSet.has(id)) orgs.remove(id);
    }
    for (const id of newSet) {
      if (!current.has(id)) orgs.add(id);
    }
    if (opts) setPickedOrgs(opts);
  }

  async function onSubmit(values: FormValues) {
    setApiError('');
    try {
      await physesApi.update(numId, {
        specId: values.specId ? Number(values.specId) : null,
        lastName: values.lastName,
        firstName: values.firstName || null,
        middleName: values.middleName || null,
        phone: values.phone || null,
        email: values.email || null,
      });

      const { toAdd, toRemove } = orgs.diff();
      await Promise.all([
        ...toAdd.map((oid) => physesApi.linkOrg(numId, oid)),
        ...toRemove.map((oid) => physesApi.unlinkOrg(numId, oid)),
      ]);

      router.push(`/physes/${id}`);
    } catch (err) {
      setApiError(extractApiError(err));
    }
  }

  return (
    <div className="mx-auto w-full space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <BackButton href={`/physes/${id}`} />
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning/15 ring-1 ring-warning/25">
            <Pencil size={15} className="text-warning" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Редактирование врача
            </p>
            <h2 className="flex min-w-0 items-center gap-1.5 truncate text-lg font-bold text-foreground">
              <Stethoscope size={15} className="shrink-0 text-muted-foreground" />
              <span className="truncate">{fullName}</span>
            </h2>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <div className="space-y-6 p-5">
            <div>
              <SectionLabel icon={User}>ФИО</SectionLabel>
              <div className="space-y-4">
                <div>
                  <Label required>Фамилия</Label>
                  <Input type="text" {...register('lastName')} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label required>Имя</Label>
                    <Input type="text" {...register('firstName')} />
                  </div>
                  <div>
                    <Label required>Отчество</Label>
                    <Input type="text" {...register('middleName')} />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            <div>
              <SectionLabel icon={BriefcaseMedical}>Специальность</SectionLabel>
              <div className="space-y-4">
                <div>
                  <Label>Специальность</Label>
                  <Controller
                    name="specId"
                    control={control}
                    render={({ field }) => (
                      <Combobox
                        options={specOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Не указана"
                        searchPlaceholder="Поиск специальности..."
                      />
                    )}
                  />
                </div>
                <div>
                  <Label>Должность</Label>
                  <Input type="text" {...register('position')} />
                </div>
              </div>
            </div>

            <hr className="border-border" />

            <div>
              <SectionLabel icon={Phone}>Контакты</SectionLabel>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Телефон</Label>
                  <Input type="tel" {...register('phone')} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" {...register('email')} />
                </div>
              </div>
            </div>

            <hr className="border-border" />

            <div>
              <SectionLabel icon={Building2}>Организации</SectionLabel>
              <MultiCombobox
                asyncSearch={searchOrgOptions}
                selectedOptions={selectedOrgs}
                value={selectedOrgIds}
                onChange={handleOrgChange}
                placeholder="Выберите организации"
                searchPlaceholder="Поиск организации..."
              />
            </div>

            {apiError && <ErrorBox message={apiError} />}
          </div>
          <CardFooter>
            <BtnSecondary type="button" onClick={() => router.push(`/physes/${id}`)}>
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
