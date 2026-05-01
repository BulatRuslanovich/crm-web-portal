'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import type { UseFormRegister } from 'react-hook-form';
import {
  BriefcaseMedical,
  Building2,
  Pencil,
  Phone,
  Stethoscope,
  User,
} from 'lucide-react';
import { searchOrgOptions } from '@/lib/api/orgs';
import { toast } from 'sonner';
import { Card, CardSkeleton, ErrorBox, Input, Label } from '@/components/ui';
import { MultiCombobox } from '@/components/MultiCombobox';
import { FormPageHeader } from '@/components/FormPageHeader';
import { FormSection } from '@/components/FormSection';
import { FormCardFooter } from '@/components/FormCardFooter';
import { physFullName } from '@/lib/initials';
import { useSubmitAction } from '@/lib/use-submit-action';
import { useSpecOptions } from '@/lib/dictionary-options';
import { PhysContactFields, PhysNameFields, PhysSpecField } from '@/components/PhysFields';
import {
  PHYS_DEFAULT_VALUES,
  type PhysFormValues,
  physToFormValues,
} from '@/lib/phys-form';
import {
  syncOrgs,
  updatePhys,
  useLoadedPhys,
  usePhysOrgPicker,
} from '@/lib/phys-edit';

export default function PhysEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const numId = Number(id);
  const submitAction = useSubmitAction();

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
    await submitAction.submit(async () => {
      await updatePhys(numId, values);
      await syncOrgs(numId, orgPicker.diff());
      toast.success('Изменения сохранены', { description: `${values.lastName} ${values.firstName}`.trim() });
      router.push(`/physes/${id}`);
    });
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
            <FormSection icon={User} title="ФИО">
              <PhysNameFields register={form.register} requireMiddleName />
            </FormSection>

            <hr className="border-border" />

            <FormSection icon={BriefcaseMedical} title="Специальность">
              <PhysSpecField
                control={form.control}
                options={specOptions}
                placeholder="Не указана"
              />
              <PositionField register={form.register} />
            </FormSection>

            <hr className="border-border" />

            <FormSection icon={Phone} title="Контакты">
              <PhysContactFields register={form.register} />
            </FormSection>

            <hr className="border-border" />

            <FormSection icon={Building2} title="Организации">
              <MultiCombobox
                asyncSearch={searchOrgOptions}
                selectedOptions={orgPicker.selectedOptions}
                value={orgPicker.selectedIds}
                onChange={orgPicker.handleChange}
                placeholder="Выберите организации"
                searchPlaceholder="Поиск организации..."
              />
            </FormSection>

            {submitAction.error && <ErrorBox message={submitAction.error} />}
          </div>

          <FormCardFooter
            onCancel={() => router.push(`/physes/${id}`)}
            isSubmitting={form.formState.isSubmitting}
            label="Сохранить"
          />
        </Card>
      </form>
    </div>
  );
}

function PositionField({ register }: { register: UseFormRegister<PhysFormValues> }) {
  return (
    <div>
      <Label>Должность</Label>
      <Input type="text" {...register('position')} />
    </div>
  );
}
