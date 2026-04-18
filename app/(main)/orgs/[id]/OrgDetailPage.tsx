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
import { Trash2, Pencil, Building2, MapPin, Hash, FileText, Navigation } from 'lucide-react';

function orgInitials(name: string): string {
  const words = name
    .replace(/["«»]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !/^(ООО|ЗАО|ОАО|ПАО|ИП|АО|МУП|ГБУЗ|ФГУП)$/i.test(w));
  if (words.length === 0) return name.slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function OrgViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const numId = Number(id);
  const { data: org } = useEntity(['org', numId], () => orgsApi.getById(numId), '/orgs');

  if (!org)
    return (
      <div className="mx-auto w-full">
        <CardSkeleton />
      </div>
    );

  async function handleDelete() {
    if (!confirm('Удалить организацию?')) return;
    await orgsApi.delete(numId);
    router.push('/orgs');
  }

  const hasCoords = org.latitude != null && org.latitude !== 0 && org.longitude != null;

  return (
    <PageTransition className="mx-auto w-full space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-2">
        <BackButton href="/orgs" />
        <span className="ml-auto text-xs text-muted-foreground">#{org.orgId}</span>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-success/15 via-success/5 to-transparent"
          aria-hidden
        />
        <div className="relative flex flex-wrap items-start gap-4 p-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-card text-sm font-bold text-success ring-1 ring-success/30">
            {orgInitials(org.orgName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Организация
            </p>
            <h2 className="truncate text-xl font-bold text-foreground">{org.orgName}</h2>
            {org.orgTypeName && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground">
                  <Building2 size={11} className="text-muted-foreground" />
                  {org.orgTypeName}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main card */}
      <Card>
        <div className="space-y-6 p-5">
          {/* Реквизиты */}
          <div>
            <SectionLabel icon={FileText}>Реквизиты</SectionLabel>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoBlock label="ИНН" icon={Hash} value={org.inn} mono />
              <InfoBlock label="Тип" icon={Building2} value={org.orgTypeName} />
            </div>
          </div>

          <hr className="border-border" />

          {/* Местоположение */}
          <div>
            <SectionLabel icon={MapPin}>Местоположение</SectionLabel>
            <div className="space-y-3">
              <InfoBlock label="Адрес" icon={MapPin} value={org.address} />
              {hasCoords && (
                <InfoBlock
                  label="Координаты"
                  icon={Navigation}
                  value={`${org.latitude}, ${org.longitude}`}
                  mono
                />
              )}
            </div>
          </div>
        </div>

        {isAdmin && (
          <CardFooter>
            <div className="flex-1">
              <BtnDanger onClick={handleDelete}>
                <Trash2 size={14} /> Удалить
              </BtnDanger>
            </div>
            <BtnSecondary onClick={() => router.push(`/orgs/${id}/edit`)}>
              <Pencil size={14} /> Редактировать
            </BtnSecondary>
          </CardFooter>
        )}
      </Card>
    </PageTransition>
  );
}

function InfoBlock({
  label,
  icon: Icon,
  value,
  mono,
}: {
  label: string;
  icon: React.ElementType;
  value?: string | null;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card ring-1 ring-border">
        <Icon size={14} className="text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          {label}
        </p>
        <p
          className={`text-sm leading-relaxed break-words text-foreground ${
            mono ? 'font-mono tabular-nums' : ''
          }`}
        >
          {value || <span className="text-muted-foreground/70">—</span>}
        </p>
      </div>
    </div>
  );
}
