'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { BriefcaseMedical, Phone, Plus, User } from 'lucide-react';
import { useApi } from '@/lib/hooks/use-api';
import { physesApi } from '@/lib/api/physes';
import { specsApi } from '@/lib/api/specs';
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
import { PhysContactFields, PhysNameFields, PhysSpecField } from '../_components/PhysFields';

interface FormValues {
  lastName: string;
  firstName: string;
  middleName: string;
  specId: string;
  phone: string;
  email: string;
}

const DEFAULT_VALUES: FormValues = {
  lastName: '',
  firstName: '',
  middleName: '',
  specId: '',
  phone: '',
  email: '',
};

export default function CreatePhysPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState('');
  const specOptions = useSpecOptions();

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<FormValues>({ defaultValues: DEFAULT_VALUES });

  async function onSubmit(values: FormValues) {
    setApiError('');
    try {
      const { data } = await physesApi.create({
        specId: Number(values.specId),
        lastName: values.lastName,
        firstName: values.firstName,
        middleName: values.middleName,
        phone: values.phone,
        email: values.email,
      });
      toast.success('Врач добавлен', { description: `${values.lastName} ${values.firstName}`.trim() });
      router.push(`/physes/${data.physId}`);
    } catch (err) {
      setApiError(extractApiError(err, 'Ошибка создания'));
    }
  }

  return (
    <div className="mx-auto w-full space-y-4">
      <FormPageHeader icon={Plus} iconTone="warning" title="Новый врач" />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <div className="space-y-6 p-5">
            <Section icon={User} title="ФИО">
              <PhysNameFields register={register} withPlaceholders />
            </Section>

            <hr className="border-border" />

            <Section icon={BriefcaseMedical} title="Специальность">
              <PhysSpecField control={control} options={specOptions} required />
            </Section>

            <hr className="border-border" />

            <Section icon={Phone} title="Контакты">
              <PhysContactFields register={register} withPlaceholders required />
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
  icon: typeof User;
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

function useSpecOptions() {
  const { data: specs = [] } = useApi(
    'specs',
    () => specsApi.getAll().then(({ data }) => data),
    { dedupingInterval: 300_000 },
  );
  return specs.map((s) => ({ value: String(s.specId), label: s.specName }));
}
