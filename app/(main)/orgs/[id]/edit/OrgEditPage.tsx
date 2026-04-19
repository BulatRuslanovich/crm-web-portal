'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Building2, FileText, MapPin, Pencil } from 'lucide-react';
import { useApi } from '@/lib/hooks/use-api';
import { useEntity } from '@/lib/hooks/use-entity';
import { orgsApi } from '@/lib/api/orgs';
import { extractApiError } from '@/lib/api/errors';
import { toast } from 'sonner';
import type { OrgResponse } from '@/lib/api/types';
import {
  BtnPrimary,
  BtnSecondary,
  Card,
  CardFooter,
  CardSkeleton,
  ErrorBox,
  SectionLabel,
} from '@/components/ui';
import { FormPageHeader } from '../../../_components/FormPageHeader';
import { OrgInnField, OrgLocationFields, OrgMainFields } from '../../_components/OrgFields';
import type { OrgFormValues } from '../../create/CreateOrgPage';

const DEFAULT_VALUES: OrgFormValues = {
  orgTypeId: '',
  orgName: '',
  inn: '',
  address: '',
  latitude: '',
  longitude: '',
};

export default function OrgEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const numId = Number(id);
  const [apiError, setApiError] = useState('');

  const { data: org } = useEntity(['org', numId], () => orgsApi.getById(numId), '/orgs');
  const typeOptions = useOrgTypeOptions();

  const form = useForm<OrgFormValues>({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (!org) return;
    form.reset(orgToFormValues(org));
  }, [org, form]);

  if (!org) {
    return (
      <div className="mx-auto w-full">
        <CardSkeleton />
      </div>
    );
  }

  async function onSubmit(values: OrgFormValues) {
    setApiError('');
    try {
      await orgsApi.update(numId, {
        orgTypeId: Number(values.orgTypeId),
        orgName: values.orgName,
        inn: values.inn || null,
        address: values.address || null,
        latitude: values.latitude ? Number(values.latitude) : null,
        longitude: values.longitude ? Number(values.longitude) : null,
      });
      toast.success('Изменения сохранены', { description: values.orgName });
      router.push(`/orgs/${id}`);
    } catch (err) {
      setApiError(extractApiError(err, 'Неизвестная ошибка при обновлении организации'));
    }
  }

  return (
    <div className="mx-auto w-full space-y-4">
      <FormPageHeader
        backHref={`/orgs/${id}`}
        icon={Pencil}
        iconTone="success"
        kicker="Редактирование организации"
        title={org.orgName}
      />

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <div className="space-y-6 p-5">
            <Section icon={Building2} title="Основная информация">
              <OrgMainFields
                register={form.register}
                control={form.control}
                typeOptions={typeOptions}
              />
            </Section>

            <hr className="border-border" />

            <Section icon={FileText} title="Реквизиты">
              <OrgInnField register={form.register} />
            </Section>

            <hr className="border-border" />

            <Section icon={MapPin} title="Местоположение">
              <OrgLocationFields register={form.register} />
            </Section>

            {apiError && <ErrorBox message={apiError} />}
          </div>

          <CardFooter>
            <BtnSecondary type="button" onClick={() => router.push(`/orgs/${id}`)}>
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

function Section({
  icon,
  title,
  children,
}: {
  icon: typeof Building2;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <SectionLabel icon={icon}>{title}</SectionLabel>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function useOrgTypeOptions() {
  const { data: types = [] } = useApi(
    'org-types',
    () => orgsApi.getTypes().then(({ data }) => data),
    { dedupingInterval: 300_000 },
  );
  return types.map((t) => ({ value: String(t.orgTypeId), label: t.orgTypeName }));
}

function orgToFormValues(org: OrgResponse): OrgFormValues {
  return {
    orgTypeId: String(org.orgTypeId),
    orgName: org.orgName,
    inn: org.inn ?? '',
    address: org.address ?? '',
    latitude: org.latitude != null ? String(org.latitude) : '',
    longitude: org.longitude != null ? String(org.longitude) : '',
  };
}
