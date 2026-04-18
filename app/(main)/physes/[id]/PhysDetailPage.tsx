'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { physesApi } from '@/lib/api/physes';
import { useEntity } from '@/lib/use-entity';
import { useIsAdmin } from '@/lib/use-is-admin';
import {
  BackButton,
  Card,
  CardFooter,
  CardSkeleton,
  SectionLabel,
  BtnSecondary,
  BtnDanger,
} from '@/components/ui';
import { PageTransition } from '@/components/motion';
import { Trash2, Pencil, Phone, Mail, Building2, Stethoscope, BriefcaseMedical } from 'lucide-react';

export default function PhysViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const numId = Number(id);
  const { data: phys } = useEntity(['phys', numId], () => physesApi.getById(numId), '/physes');

  if (!phys)
    return (
      <div className="mx-auto w-full">
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
    <PageTransition className="mx-auto w-full space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-2">
        <BackButton href="/physes" />
        <span className="ml-auto text-xs text-muted-foreground">#{phys.physId}</span>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-warning/20 via-warning/5 to-transparent"
          aria-hidden
        />
        <div className="relative flex flex-wrap items-start gap-4 p-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-card text-base font-bold text-warning ring-1 ring-warning/30">
            {initials || <Stethoscope size={20} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Врач
            </p>
            <h2 className="truncate text-xl font-bold text-foreground">{fullName}</h2>
            {phys.specName && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground">
                  <BriefcaseMedical size={11} className="text-muted-foreground" />
                  {phys.specName}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main card */}
      <Card>
        <div className="space-y-6 p-5">
          {/* Contacts */}
          <div>
            <SectionLabel icon={Phone}>Контакты</SectionLabel>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ContactBlock
                label="Телефон"
                icon={Phone}
                value={phys.phone}
                href={phys.phone ? `tel:${phys.phone.replace(/\s/g, '')}` : undefined}
              />
              <ContactBlock
                label="Email"
                icon={Mail}
                value={phys.email}
                href={phys.email ? `mailto:${phys.email}` : undefined}
              />
            </div>
          </div>

          {/* Orgs */}
          {phys.orgs.length > 0 && (
            <>
              <hr className="border-border" />
              <div>
                <SectionLabel icon={Building2}>
                  Организации{' '}
                  <span className="ml-1 text-muted-foreground/60">· {phys.orgs.length}</span>
                </SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {phys.orgs.map((o) => (
                    <span
                      key={o.orgId}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground"
                    >
                      <Building2 size={11} className="text-muted-foreground" />
                      {o.orgName}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {isAdmin && (
          <CardFooter>
            <div className="flex-1">
              <BtnDanger onClick={handleDelete}>
                <Trash2 size={14} /> Удалить
              </BtnDanger>
            </div>
            <BtnSecondary onClick={() => router.push(`/physes/${id}/edit`)}>
              <Pencil size={14} /> Редактировать
            </BtnSecondary>
          </CardFooter>
        )}
      </Card>
    </PageTransition>
  );
}

function ContactBlock({
  label,
  icon: Icon,
  value,
  href,
}: {
  label: string;
  icon: React.ElementType;
  value?: string | null;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card ring-1 ring-border">
        <Icon size={14} className="text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          {label}
        </p>
        <p className="truncate text-sm font-medium text-foreground">
          {value || <span className="text-muted-foreground/70">—</span>}
        </p>
      </div>
    </>
  );

  const baseCls =
    'flex items-start gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3';

  if (href && value) {
    return (
      <a
        href={href}
        className={`${baseCls} transition-colors hover:border-primary/30 hover:bg-muted/60`}
      >
        {content}
      </a>
    );
  }
  return <div className={baseCls}>{content}</div>;
}
