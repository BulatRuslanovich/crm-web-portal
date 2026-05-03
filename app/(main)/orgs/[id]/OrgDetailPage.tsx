'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
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
        <div className="space-y-6 p-5">
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
          <InfoBlock
            label="Координаты"
            value={`${org.latitude}, ${org.longitude}`}
            mono
          />
        )}
      </div>
    </div>
  );
}
