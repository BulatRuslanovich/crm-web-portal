'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { physesApi } from '@/lib/api/physes';
import { useEntity } from '@/lib/use-entity';
import {
  BackButton, Card, CardFooter, CardSkeleton, Field,
  BtnSecondary, BtnDanger,
} from '@/components/ui';
import { PageTransition } from '@/components/motion';

export default function PhysViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: phys, numId } = useEntity(physesApi.getById, id, '/physes');

  if (!phys) return <div className="max-w-2xl mx-auto"><CardSkeleton /></div>;

  const fullName = [phys.lastName, phys.firstName, phys.middleName].filter(Boolean).join(' ');

  async function handleDelete() {
    if (!confirm('Удалить врача?')) return;
    await physesApi.delete(numId);
    router.push('/physes');
  }

  return (
    <PageTransition className="max-w-2xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <BackButton onClick={() => router.push('/physes')} />
        <h2 className="text-xl font-semibold text-(--fg) flex-1">{fullName}</h2>
        {phys.specName && (
          <span className="text-xs px-2.5 py-0.5 bg-(--surface-raised) border border-(--border) text-(--fg-muted) rounded-full">
            {phys.specName}
          </span>
        )}
      </div>

      <Card>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Должность" value={phys.position} />
          <Field label="Телефон" value={phys.phone} />
          <Field label="Email" value={phys.email} />
          {phys.orgs.length > 0 && (
            <div className="col-span-2">
              <p className="text-xs font-semibold text-(--fg-muted) uppercase tracking-wide mb-1.5">Организации</p>
              <div className="flex flex-wrap gap-1.5">
                {phys.orgs.map((o) => (
                  <span key={o} className="text-xs px-2.5 py-0.5 bg-(--primary-subtle) text-(--primary-text) border border-(--primary-border) rounded-full">{o}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        <CardFooter>
          <BtnDanger onClick={handleDelete}>Удалить</BtnDanger>
          <BtnSecondary onClick={() => router.push(`/physes/${id}/edit`)}>Редактировать</BtnSecondary>
        </CardFooter>
      </Card>
    </PageTransition>
  );
}
