'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Building2, FileText, MapPin, Plus } from 'lucide-react';
import { orgsApi } from '@/lib/api/orgs';
import { toast } from 'sonner';
import { Card, ErrorBox } from '@/components/ui';
import { FormPageHeader } from '@/components/FormPageHeader';
import { FormSection } from '@/components/FormSection';
import { FormCardFooter } from '@/components/FormCardFooter';
import { useOrgTypeOptions } from '@/lib/dictionary-options';
import { useSubmitAction } from '@/lib/use-submit-action';
import { OrgInnField, OrgLocationFields, OrgMainFields } from '@/components/OrgFields';
import {
  ORG_DEFAULT_VALUES,
  orgFormToCreateRequest,
  type OrgFormValues,
} from '@/lib/org-form';

export default function CreateOrgPage() {
  const router = useRouter();
  const typeOptions = useOrgTypeOptions();
  const submitAction = useSubmitAction({
    fallbackError: 'Неизвестная ошибка при создании организации',
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<OrgFormValues>({ defaultValues: ORG_DEFAULT_VALUES });

  async function onSubmit(values: OrgFormValues) {
    await submitAction.submit(async () => {
      const { data } = await orgsApi.create(orgFormToCreateRequest(values));
      toast.success('Организация создана', { description: values.orgName });
      router.push(`/orgs/${data.orgId}`);
    });
  }

  return (
    <div className="mx-auto w-full space-y-4">
      <FormPageHeader icon={Plus} iconTone="success" title="Новая организация" />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <div className="space-y-6 p-5">
            <FormSection icon={Building2} title="Основная информация">
              <OrgMainFields
                register={register}
                control={control}
                typeOptions={typeOptions}
                withPlaceholders
              />
            </FormSection>

            <hr className="border-border" />

            <FormSection icon={FileText} title="Реквизиты">
              <OrgInnField register={register} withPlaceholder />
            </FormSection>

            <hr className="border-border" />

            <FormSection icon={MapPin} title="Местоположение">
              <OrgLocationFields register={register} withPlaceholders />
            </FormSection>

            {submitAction.error && <ErrorBox message={submitAction.error} />}
          </div>

          <FormCardFooter
            onCancel={() => router.back()}
            isSubmitting={isSubmitting}
            label="Создать"
            variant="create"
          />
        </Card>
      </form>
    </div>
  );
}
