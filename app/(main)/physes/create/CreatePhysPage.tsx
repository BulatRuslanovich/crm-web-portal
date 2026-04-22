'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { BriefcaseMedical, Phone, Plus, User } from 'lucide-react';
import { physesApi } from '@/lib/api/physes';
import { toast } from 'sonner';
import {
  BtnSecondary,
  BtnSuccess,
  Card,
  CardFooter,
  ErrorBox,
} from '@/components/ui';
import { FormPageHeader } from '../../_components/FormPageHeader';
import { FormSection } from '../../_components/FormSection';
import { useSpecOptions } from '../../_lib/dictionary-options';
import { useSubmitAction } from '../../_lib/use-submit-action';
import { PhysContactFields, PhysNameFields, PhysSpecField } from '../_components/PhysFields';
import {
  PHYS_DEFAULT_VALUES,
  physFormToCreateRequest,
  type PhysFormValues,
} from '../_lib/phys-form';

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
      toast.success('Врач добавлен', { description: `${values.lastName} ${values.firstName}`.trim() });
      router.push(`/physes/${data.physId}`);
    });
  }

  return (
    <div className="mx-auto w-full space-y-4">
      <FormPageHeader icon={Plus} iconTone="warning" title="Новый врач" />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <div className="space-y-6 p-5">
            <FormSection icon={User} title="ФИО">
              <PhysNameFields register={register} withPlaceholders />
            </FormSection>

            <hr className="border-border" />

            <FormSection icon={BriefcaseMedical} title="Специальность">
              <PhysSpecField control={control} options={specOptions} required />
            </FormSection>

            <hr className="border-border" />

            <FormSection icon={Phone} title="Контакты">
              <PhysContactFields register={register} withPlaceholders required />
            </FormSection>

            {submitAction.error && <ErrorBox message={submitAction.error} />}
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
