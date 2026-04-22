'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Building2, FileText, MapPin, Pencil } from 'lucide-react';
import { useEntity } from '@/lib/hooks/use-entity';
import { orgsApi } from '@/lib/api/orgs';
import { toast } from 'sonner';
import {
  BtnPrimary,
  BtnSecondary,
  Card,
  CardFooter,
  CardSkeleton,
  ErrorBox,
} from '@/components/ui';
import { FormPageHeader } from '../../../_components/FormPageHeader';
import { FormSection } from '../../../_components/FormSection';
import { useOrgTypeOptions } from '../../../_lib/dictionary-options';
import { useSubmitAction } from '../../../_lib/use-submit-action';
import { OrgInnField, OrgLocationFields, OrgMainFields } from '../../_components/OrgFields';
import {
  ORG_DEFAULT_VALUES,
  orgFormToUpdateRequest,
  orgToFormValues,
  type OrgFormValues,
} from '../../_lib/org-form';

export default function OrgEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const numId = Number(id);
  const submitAction = useSubmitAction({
    fallbackError: 'Неизвестная ошибка при обновлении организации',
  });

  const { data: org } = useEntity(['org', numId], () => orgsApi.getById(numId), '/orgs');
  const typeOptions = useOrgTypeOptions();

  const form = useForm<OrgFormValues>({ defaultValues: ORG_DEFAULT_VALUES });

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
    await submitAction.submit(async () => {
      await orgsApi.update(numId, orgFormToUpdateRequest(values));
      toast.success('Изменения сохранены', { description: values.orgName });
      router.push(`/orgs/${id}`);
    });
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
            <FormSection icon={Building2} title="Основная информация">
              <OrgMainFields
                register={form.register}
                control={form.control}
                typeOptions={typeOptions}
              />
            </FormSection>

            <hr className="border-border" />

            <FormSection icon={FileText} title="Реквизиты">
              <OrgInnField register={form.register} />
            </FormSection>

            <hr className="border-border" />

            <FormSection icon={MapPin} title="Местоположение">
              <OrgLocationFields register={form.register} />
            </FormSection>

            {submitAction.error && <ErrorBox message={submitAction.error} />}
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
