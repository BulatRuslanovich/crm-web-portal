'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { orgsApi } from '@/lib/api/orgs';
import { useAuth } from '@/lib/auth-context';
import { useEntity } from '@/lib/use-entity';
import {
  BackButton, Card, CardFooter, CardSkeleton, Field,
  BtnSecondary, BtnDanger,
} from '@/components/ui';

export default function OrgViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.policies?.includes('Admin');
  const { data: org, numId } = useEntity(orgsApi.getById, id, '/orgs');

  if (!org) return <div className="max-w-2xl mx-auto"><CardSkeleton /></div>;

  async function handleDelete() {
    if (!confirm('Удалить организацию?')) return;
    await orgsApi.delete(numId);
    router.push('/orgs');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <BackButton onClick={() => router.push('/orgs')} />
        <h2 className="text-xl font-semibold text-(--fg) flex-1">{org.orgName}</h2>
        <span className="text-xs px-2.5 py-0.5 bg-(--surface-raised) border border-(--border) text-(--fg-muted) rounded-full">
          {org.orgTypeName}
        </span>
      </div>

      <Card>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="ИНН" value={org.inn} />
          <Field label="Адрес" value={org.address} />
          {org.latitude != null && (
            <Field label="Координаты" value={`${org.latitude}, ${org.longitude}`} />
          )}
        </div>
        {isAdmin && (
          <CardFooter>
            <BtnDanger onClick={handleDelete}>Удалить</BtnDanger>
            <BtnSecondary onClick={() => router.push(`/orgs/${id}/edit`)}>Редактировать</BtnSecondary>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
