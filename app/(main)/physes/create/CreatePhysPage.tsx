'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { useApi } from '@/lib/use-api';
import { physesApi } from '@/lib/api/physes';
import { specsApi } from '@/lib/api/specs';
import { extractApiError } from '@/lib/api/errors';
import {
  BackButton,
  Card,
  CardFooter,
  Label,
  Input,
  ErrorBox,
  BtnSecondary,
  BtnSuccess,
  SectionLabel,
} from '@/components/ui';
import { Combobox } from '@/components/Combobox';
import { User, BriefcaseMedical, Phone, Plus } from 'lucide-react';

interface FormValues {
  lastName: string;
  firstName: string;
  middleName: string;
  specId: string;
  phone: string;
  email: string;
}

export default function CreatePhysPage() {
  const router = useRouter();
  const { data: specs = [] } = useApi(
    'specs',
    () => specsApi.getAll().then(({ data }) => data),
    { dedupingInterval: 300_000 },
  );
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      lastName: '',
      firstName: '',
      middleName: '',
      specId: '',
      phone: '',
      email: '',
    },
  });

  const specOptions = specs.map((s) => ({
    value: String(s.specId),
    label: s.specName,
  }));

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
      router.push(`/physes/${data.physId}`);
    } catch (err) {
      setApiError(extractApiError(err, 'Ошибка создания'));
    }
  }

  return (
    <div className="mx-auto w-full space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <BackButton />
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/15 ring-1 ring-warning/25">
            <Plus size={16} className="text-warning" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Новый врач</h2>
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
                  <Input type="text" placeholder="Иванов" {...register('lastName')} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label required>Имя</Label>
                    <Input type="text" placeholder="Иван" {...register('firstName')} />
                  </div>
                  <div>
                    <Label>Отчество</Label>
                    <Input type="text" placeholder="Иванович" {...register('middleName')} />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            <div>
              <SectionLabel icon={BriefcaseMedical}>Специальность</SectionLabel>
              <div className="space-y-4">
                <div>
                  <Label required>Специальность</Label>
                  <Controller
                    name="specId"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Combobox
                        options={specOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Выберите специальность"
                        searchPlaceholder="Поиск специальности..."
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            <hr className="border-border" />

            <div>
              <SectionLabel icon={Phone}>Контакты</SectionLabel>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label required>Телефон</Label>
                  <Input type="tel" placeholder="+7 999 000 00 00" {...register('phone')} />
                </div>
                <div>
                  <Label required>Email</Label>
                  <Input type="email" placeholder="doctor@example.com" {...register('email')} />
                </div>
              </div>
            </div>

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
