'use client';

import { useState, useEffect, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { useApi } from '@/lib/use-api';
import { useSetDiff } from '@/lib/use-set-diff';
import { physesApi } from '@/lib/api/physes';
import { orgsApi } from '@/lib/api/orgs';
import { specsApi } from '@/lib/api/specs';
import type { OrgResponse } from '@/lib/api/types';
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
} from '@/components/ui';
import { Combobox } from '@/components/Combobox';
import { MultiCombobox } from '@/components/MultiCombobox';

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

  const numId = Number(id);
  const { data: phys, error: physError } = useApi(
    ['phys', numId],
    () => physesApi.getById(numId).then((r) => r.data),
  );

  useEffect(() => {
    if (physError) router.push('/physes');
  }, [physError, router]);

  const { data: specs = [] } = useApi(
    'specs',
    () => specsApi.getAll().then(({ data }) => data),
    { dedupingInterval: 300_000 },
  );
  const { data: allOrgs = [] } = useApi(
    'orgs-all',
    () => orgsApi.getAll(1, 1000).then(({ data }) => data.items),
    { dedupingInterval: 300_000 },
  );

  const orgSourceIds = useMemo(
    () =>
      phys && allOrgs.length > 0
        ? allOrgs
            .filter((o: OrgResponse) => phys.orgs.includes(o.orgName))
            .map((o: OrgResponse) => o.orgId)
        : [],
    [phys, allOrgs],
  );
  const orgs = useSetDiff(orgSourceIds);

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
      position: phys.position ?? '',
    });
  }, [phys, reset]);

  if (!phys)
    return (
      <div className="mx-auto max-w-2xl">
        <CardSkeleton />
      </div>
    );

  const fullName = [phys.lastName, phys.firstName, phys.middleName].filter(Boolean).join(' ');

  const specOptions = specs.map((s) => ({
    value: String(s.specId),
    label: s.specName,
  }));

  const orgOptions = allOrgs.map((o: OrgResponse) => ({
    value: String(o.orgId),
    label: o.orgName,
  }));

  const selectedOrgIds = [...orgs.selected].map(String);

  function handleOrgChange(values: string[]) {
    const newSet = new Set(values.map(Number));
    const current = orgs.selected;
    for (const id of current) {
      if (!newSet.has(id)) orgs.remove(id);
    }
    for (const id of newSet) {
      if (!current.has(id)) orgs.add(id);
    }
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
        position: values.position || null,
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
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <BackButton onClick={() => router.push(`/physes/${id}`)} />
        <h2 className="flex-1 text-xl font-semibold text-(--fg)">{fullName}</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <div className="space-y-4 p-5">
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

            <div>
              <Label>Организации</Label>
              <MultiCombobox
                options={orgOptions}
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
