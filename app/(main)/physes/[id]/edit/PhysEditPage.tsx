'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  BriefcaseMedical,
  Building2,
  Pencil,
  Phone,
  Stethoscope,
  User,
} from 'lucide-react';
import { searchOrgOptions } from '@/lib/api/orgs';
import { extractApiError } from '@/lib/api/errors';
import { toast } from 'sonner';
import {
  BtnPrimary,
  BtnSecondary,
  Card,
  CardFooter,
  CardSkeleton,
  ErrorBox,
  Input,
  Label,
  SectionLabel,
} from '@/components/ui';
import { MultiCombobox } from '@/components/MultiCombobox';
import { FormPageHeader } from '../../../_components/FormPageHeader';
import { physFullName } from '../../../_lib/initials';
import {
  PhysContactFields,
  PhysNameFields,
  PhysSpecField,
} from '../../_components/PhysFields';
import {
  PHYS_DEFAULT_VALUES,
  type PhysFormValues,
  physToFormValues,
  syncOrgs,
  updatePhys,
  useLoadedPhys,
  usePhysOrgPicker,
  useSpecOptions,
} from './_lib/phys-edit';

export default function PhysEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const numId = Number(id);
  const [apiError, setApiError] = useState('');

  const phys = useLoadedPhys(numId);
  const specOptions = useSpecOptions();
  const orgPicker = usePhysOrgPicker(phys);
  const form = useForm<PhysFormValues>({ defaultValues: PHYS_DEFAULT_VALUES });

  useEffect(() => {
    if (!phys) return;
    form.reset(physToFormValues(phys));
  }, [phys, form]);

  if (!phys) {
    return (
      <div className="mx-auto w-full">
        <CardSkeleton />
      </div>
    );
  }

  async function onSubmit(values: PhysFormValues) {
    setApiError('');
    try {
      await updatePhys(numId, values);
      await syncOrgs(numId, orgPicker.diff());
      toast.success('Изменения сохранены', { description: `${values.lastName} ${values.firstName}`.trim() });
      router.push(`/physes/${id}`);
    } catch (err) {
      setApiError(extractApiError(err));
    }
  }

  return (
    <div className="mx-auto w-full space-y-4">
      <FormPageHeader
        backHref={`/physes/${id}`}
        icon={Pencil}
        iconTone="warning"
        kicker="Редактирование врача"
        title={physFullName(phys.lastName, phys.firstName, phys.middleName)}
        subtitleIcon={Stethoscope}
      />

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <div className="space-y-6 p-5">
            <Section icon={User} title="ФИО">
              <PhysNameFields register={form.register} requireMiddleName />
            </Section>

            <hr className="border-border" />

            <Section icon={BriefcaseMedical} title="Специальность">
              <PhysSpecField
                control={form.control}
                options={specOptions}
                placeholder="Не указана"
              />
              <PositionField register={form.register} />
            </Section>

            <hr className="border-border" />

            <Section icon={Phone} title="Контакты">
              <PhysContactFields register={form.register} />
            </Section>

            <hr className="border-border" />

            <Section icon={Building2} title="Организации">
              <MultiCombobox
                asyncSearch={searchOrgOptions}
                selectedOptions={orgPicker.selectedOptions}
                value={orgPicker.selectedIds}
                onChange={orgPicker.handleChange}
                placeholder="Выберите организации"
                searchPlaceholder="Поиск организации..."
              />
            </Section>

            {apiError && <ErrorBox message={apiError} />}
          </div>

          <CardFooter>
            <BtnSecondary type="button" onClick={() => router.push(`/physes/${id}`)}>
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

/* eslint-disable @typescript-eslint/no-explicit-any */
function PositionField({ register }: { register: any }) {
  return (
    <div>
      <Label>Должность</Label>
      <Input type="text" {...register('position')} />
    </div>
  );
}
