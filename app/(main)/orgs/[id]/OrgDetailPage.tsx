'use client';

import { use } from 'react';
import type React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Hash, MapPin, Navigation } from 'lucide-react';
import { orgsApi } from '@/lib/api/orgs';
import { useEntity } from '@/lib/hooks/use-entity';
import { toast } from 'sonner';
import { useRoles } from '@/lib/hooks/use-roles';
import type { OrgResponse } from '@/lib/api/types';
import { BackButton, Card, CardSkeleton, SectionLabel } from '@/components/ui';
import { PageTransition } from '@/components/motion';
import { Hero } from '@/components/Hero';
import { EntityHistoryFeed } from '@/components/EntityHistoryFeed';
import { InfoBlock } from '@/components/InfoBlock';
import { AdminDetailFooter } from '@/components/AdminDetailFooter';
import { useConfirm } from '@/components/ConfirmDialog';

const HERO_ACCENT = 'from-success/15 via-success/5 to-transparent';

export default function OrgDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAdmin } = useRoles();
  const { confirm, dialog } = useConfirm();

  const numId = Number(id);
  const { data: org } = useEntity(['org', numId], () => orgsApi.getById(numId), '/orgs');

  if (!org) {
    return (
      <div className="mx-auto w-full">
        <CardSkeleton />
      </div>
    );
  }

  async function handleDelete() {
    const ok = await confirm({
      title: 'Удалить организацию?',
      description: `Организация #${numId} будет удалена безвозвратно.`,
      confirmLabel: 'Удалить',
    });
    if (!ok) return;
    await orgsApi.delete(numId);
    toast('Организация удалена', { description: org?.orgName });
    router.push('/orgs');
  }

  return (
    <PageTransition className="mx-auto w-full space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <BackButton href="/orgs" />
        <span className="text-muted-foreground ml-auto text-xs">#{org.orgId}</span>
      </div>

      <Hero accentGradient={HERO_ACCENT}>
        <OrgHeroContent org={org} />
      </Hero>

      <Card>
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5 p-5">
            <RequisitesSection org={org} />
            <hr className="border-border" />
            <LocationSection org={org} />
            {isAdmin && (
              <>
                <hr className="border-border" />
                <EntityHistoryFeed entityType="org" entityId={numId} />
              </>
            )}
          </div>
          <OrgDossierAside org={org} />
        </div>

        <AdminDetailFooter
          show={isAdmin}
          onDelete={handleDelete}
          onEdit={() => router.push(`/orgs/${id}/edit`)}
        />
      </Card>
      {dialog}
    </PageTransition>
  );
}

function OrgDossierAside({ org }: { org: OrgResponse }) {
  const mapHref = mapLink(org);

  return (
    <aside className="border-border bg-muted/20 space-y-4 border-t p-5 lg:border-t-0 lg:border-l">
      <div>
        <SectionLabel>Сводка</SectionLabel>
        <div className="space-y-2">
          <DossierFact icon={Building2} label="Тип" value={org.orgTypeName} />
          <DossierFact icon={Hash} label="ИНН" value={org.inn} mono />
          <DossierFact icon={MapPin} label="Адрес" value={org.address} />
        </div>
      </div>

      <div className="grid gap-2">
        {mapHref && (
          <Link
            href={mapHref}
            target="_blank"
            rel="noopener noreferrer"
            className="border-border bg-card hover:bg-muted flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors"
          >
            <Navigation size={14} />
            Открыть на карте
          </Link>
        )}
        <Link
          href={`/activs/create`}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
        >
          Создать визит
        </Link>
      </div>
    </aside>
  );
}

function DossierFact({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | number | null;
  mono?: boolean;
}) {
  return (
    <div className="border-border bg-card rounded-md border px-3 py-2">
      <p className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase">
        <Icon size={11} />
        {label}
      </p>
      <p className={`text-foreground mt-1 text-sm ${mono ? 'font-mono tabular-nums' : ''}`}>
        {value || <span className="text-muted-foreground/70">--</span>}
      </p>
    </div>
  );
}

function mapLink(org: OrgResponse): string | null {
  if (org.latitude != null && org.latitude !== 0 && org.longitude != null) {
    return `https://www.openstreetmap.org/?mlat=${org.latitude}&mlon=${org.longitude}#map=16/${org.latitude}/${org.longitude}`;
  }
  if (org.address) return `https://www.openstreetmap.org/search?query=${encodeURIComponent(org.address)}`;
  return null;
}

function OrgHeroContent({ org }: { org: OrgResponse }) {
  return (
    <div className="flex flex-wrap items-start gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
          Организация
        </p>
        <h2 className="text-foreground truncate text-xl font-bold">{org.orgName}</h2>
      </div>
    </div>
  );
}

function RequisitesSection({ org }: { org: OrgResponse }) {
  return (
    <div>
      <SectionLabel>Реквизиты</SectionLabel>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoBlock label="ИНН" value={org.inn} mono />
        <InfoBlock label="Тип" value={org.orgTypeName} />
      </div>
    </div>
  );
}

function LocationSection({ org }: { org: OrgResponse }) {
  const hasCoords = org.latitude != null && org.latitude !== 0 && org.longitude != null;

  return (
    <div>
      <SectionLabel>Местоположение</SectionLabel>
      <div className="space-y-3">
        <InfoBlock label="Адрес" value={org.address} />
        {hasCoords && (
          <InfoBlock label="Координаты" value={`${org.latitude}, ${org.longitude}`} mono />
        )}
      </div>
    </div>
  );
}
