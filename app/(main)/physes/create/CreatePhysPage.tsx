'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { physesApi } from '@/lib/api/physes';
import { toast } from 'sonner';
import { Card, ErrorBox } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { FormSection } from '@/components/FormSection';
import { FormCardFooter } from '@/components/FormCardFooter';
import { useSpecOptions } from '@/lib/dictionary-options';
import { useSubmitAction } from '@/lib/use-submit-action';
import { PhysContactFields, PhysNameFields, PhysSpecField } from '@/components/PhysFields';
import { PHYS_DEFAULT_VALUES, physFormToCreateRequest, type PhysFormValues } from '@/lib/phys-form';

export default function CreatePhysPage() {
  const router = useRouter();
  const specOptions = useSpecOptions();
  const submitAction = useSubmitAction({ fallbackError: 'Ошибка создания' });

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<PhysFormValues>({ defaultValues: PHYS_DEFAULT_VALUES });

  async function onSubmit(values: PhysFormValues) {
    await submitAction.submit(async () => {
      const { data } = await physesApi.create(physFormToCreateRequest(values));
      toast.success('Врач добавлен', {
        description: `${values.lastName} ${values.firstName}`.trim(),
      });
      router.push(`/physes/${data.physId}`);
    });
  }

  return (
    <div className="mx-auto w-full space-y-4">
      <PageHeader title="Новый врач" />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <div className="space-y-6 p-5">
            <FormSection title="ФИО">
              <PhysNameFields register={register} withPlaceholders />
            </FormSection>

            <hr className="border-border" />

            <FormSection title="Специальность">
              <PhysSpecField control={control} options={specOptions} required />
            </FormSection>

            <hr className="border-border" />

            <FormSection title="Контакты">
              <PhysContactFields register={register} withPlaceholders required />
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
