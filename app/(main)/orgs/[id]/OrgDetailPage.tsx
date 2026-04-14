'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { orgsApi } from '@/lib/api/orgs';
import { useEntity } from '@/lib/use-entity';
import { useIsAdmin } from '@/lib/use-is-admin';
import {
  BackButton,
  Card,
  CardFooter,
  CardSkeleton,
  Field,
  SectionLabel,
  BtnSecondary,
  BtnDanger,
} from '@/components/ui';
import { PageTransition } from '@/components/motion';
import { Trash2, Pencil, Building2, MapPin } from 'lucide-react';

export default function OrgViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const numId = Number(id);
  const { data: org } = useEntity(['org', numId], () => orgsApi.getById(numId), '/orgs');

  if (!org)
    return (
      <div className="mx-auto max-w-2xl">
        <CardSkeleton />
      </div>
    );

  async function handleDelete() {
    if (!confirm('Удалить организацию?')) return;
    await orgsApi.delete(numId);
    router.push('/orgs');
  }

  return (
    <PageTransition className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <BackButton href="/orgs" />
        <h2 className="flex-1 text-xl font-bold text-(--fg)">{org.orgName}</h2>
        <span className="rounded-full border border-(--border) bg-(--surface-raised) px-2.5 py-1 text-xs font-medium text-(--fg-muted)">
          {org.orgTypeName}
        </span>
      </div>

      <Card>
        <div className="space-y-5 p-5">
          <div>
            <SectionLabel icon={Building2}>Реквизиты</SectionLabel>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="ИНН" value={org.inn} />
              <Field label="Тип" value={org.orgTypeName} />
            </div>
          </div>

          <div>
            <SectionLabel icon={MapPin}>Местоположение</SectionLabel>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Адрес" value={org.address} />
              {org.latitude != null && org.latitude !== 0 && (
                <Field label="Координаты" value={`${org.latitude}, ${org.longitude}`} />
              )}
            </div>
          </div>
        </div>

        {isAdmin && (
          <CardFooter>
            <BtnDanger onClick={handleDelete}>
              <Trash2 size={14} /> Удалить
            </BtnDanger>
            <BtnSecondary onClick={() => router.push(`/orgs/${id}/edit`)}>
              <Pencil size={14} /> Редактировать
            </BtnSecondary>
          </CardFooter>
        )}
      </Card>
    </PageTransition>
  );
}
