'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Building2, FileText, MapPin, Plus } from 'lucide-react';
import { useApi } from '@/lib/hooks/use-api';
import { orgsApi } from '@/lib/api/orgs';
import { extractApiError } from '@/lib/api/errors';
import { toast } from 'sonner';
import {
  BtnSecondary,
  BtnSuccess,
  Card,
  CardFooter,
  ErrorBox,
  SectionLabel,
} from '@/components/ui';
import { FormPageHeader } from '../../_components/FormPageHeader';
import { OrgInnField, OrgLocationFields, OrgMainFields } from '../_components/OrgFields';

export interface OrgFormValues {
  orgTypeId: string;
  orgName: string;
  inn: string;
  address: string;
  latitude: string;
  longitude: string;
}

const DEFAULT_VALUES: OrgFormValues = {
  orgTypeId: '',
  orgName: '',
  inn: '',
  address: '',
  latitude: '',
  longitude: '',
};

export default function CreateOrgPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState('');
  const typeOptions = useOrgTypeOptions();

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<OrgFormValues>({ defaultValues: DEFAULT_VALUES });

  async function onSubmit(values: OrgFormValues) {
    setApiError('');
    try {
      const { data } = await orgsApi.create({
        orgTypeId: Number(values.orgTypeId),
        orgName: values.orgName,
        inn: values.inn || '',
        address: values.address || '',
        latitude: values.latitude ? Number(values.latitude) : 0,
        longitude: values.longitude ? Number(values.longitude) : 0,
      });
      toast.success('Организация создана', { description: values.orgName });
      router.push(`/orgs/${data.orgId}`);
    } catch (err) {
      setApiError(extractApiError(err, 'Неизвестная ошибка при создании организации'));
    }
  }

  return (
    <div className="mx-auto w-full space-y-4">
      <FormPageHeader icon={Plus} iconTone="success" title="Новая организация" />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <div className="space-y-6 p-5">
            <Section icon={Building2} title="Основная информация">
              <OrgMainFields
                register={register}
                control={control}
                typeOptions={typeOptions}
                withPlaceholders
              />
            </Section>

            <hr className="border-border" />

            <Section icon={FileText} title="Реквизиты">
              <OrgInnField register={register} withPlaceholder />
            </Section>

            <hr className="border-border" />

            <Section icon={MapPin} title="Местоположение">
              <OrgLocationFields register={register} withPlaceholders />
            </Section>

            {apiError && <ErrorBox message={apiError} />}
          </div>

          <CardFooter>
            <BtnSecondary type="button" onClick={() => router.back()}>
              Отмена
            </BtnSecondary>
            <BtnSuccess type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Создание...' : 'Создать'}
            </BtnSuccess>
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

