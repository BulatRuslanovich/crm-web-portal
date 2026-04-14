'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { physesApi } from '@/lib/api/physes';
import { useApi } from '@/lib/use-api';
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
import { Trash2, Pencil, User, Phone, Mail, Briefcase, Building2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function PhysViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const isAdmin = user?.policies?.includes('Admin');
  const { id } = use(params);
  const router = useRouter();
  const numId = Number(id);
  const { data: phys, error: physError } = useApi(
    ['phys', numId],
    () => physesApi.getById(numId).then((r) => r.data),
  );

  useEffect(() => {
    if (physError) router.push('/physes');
  }, [physError, router]);

  if (!phys)
    return (
      <div className="mx-auto max-w-2xl">
        <CardSkeleton />
      </div>
    );

  const fullName = [phys.lastName, phys.firstName, phys.middleName].filter(Boolean).join(' ');
  const initials = ((phys.lastName?.[0] ?? '') + (phys.firstName?.[0] ?? '')).toUpperCase();

  async function handleDelete() {
    if (!confirm('Удалить врача?')) return;
    await physesApi.delete(numId);
    router.push('/physes');
  }

  return (
    <PageTransition className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <BackButton onClick={() => router.push('/physes')} />
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--primary-subtle) text-sm font-bold text-(--primary-text)">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-bold text-(--fg)">{fullName}</h2>
          {phys.specName && (
            <span className="rounded-full border border-(--border) bg-(--surface-raised) px-2.5 py-0.5 text-xs font-medium text-(--fg-muted)">
              {phys.specName}
            </span>
          )}
        </div>
      </div>

      <Card>
        <div className="space-y-5 p-5">
          <div>
            <SectionLabel icon={User}>Информация</SectionLabel>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Должность" value={phys.position} icon={Briefcase} />
              <Field label="Специальность" value={phys.specName} />
            </div>
          </div>

          <div>
            <SectionLabel icon={Phone}>Контакты</SectionLabel>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Телефон" value={phys.phone} icon={Phone} />
              <Field label="Email" value={phys.email} icon={Mail} />
            </div>
          </div>

          {phys.orgs.length > 0 && (
            <div>
              <SectionLabel icon={Building2}>Организации</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {phys.orgs.map((o) => (
                  <span
                    key={o.orgId}
                    className="rounded-full border border-(--primary-border) bg-(--primary-subtle) px-3 py-1 text-xs font-medium text-(--primary-text)"
                  >
                    {o.orgName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        {isAdmin && (
          <CardFooter>
            <BtnDanger onClick={handleDelete}>
              <Trash2 size={14} /> Удалить
            </BtnDanger>
            <BtnSecondary onClick={() => router.push(`/physes/${id}/edit`)}>
              <Pencil size={14} /> Редактировать
            </BtnSecondary>
          </CardFooter>
        )}
      </Card>
    </PageTransition>
  );
}
