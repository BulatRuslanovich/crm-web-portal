'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, FileText, Hash, MapPin, Navigation, Pencil, Trash2 } from 'lucide-react';
import { orgsApi } from '@/lib/api/orgs';
import { useEntity } from '@/lib/hooks/use-entity';
import { toast } from 'sonner';
import { useIsAdmin } from '@/lib/hooks/use-is-admin';
import type { OrgResponse } from '@/lib/api/types';
import {
  BackButton,
  BtnDanger,
  BtnSecondary,
  Card,
  CardFooter,
  CardSkeleton,
  SectionLabel,
} from '@/components/ui';
import { PageTransition } from '@/components/motion';
import { DetailHero } from '../../_components/DetailHero';
import { InfoBlock } from '../../_components/InfoBlock';
import { orgInitials } from '../../_lib/initials';
import { useConfirm } from '@/components/ConfirmDialog';

const HERO_ACCENT = 'from-success/15 via-success/5 to-transparent';

export default function OrgDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const isAdmin = useIsAdmin();
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
        <span className="ml-auto text-xs text-muted-foreground">#{org.orgId}</span>
      </div>

      <DetailHero accentGradient={HERO_ACCENT}>
        <OrgHeroContent org={org} />
      </DetailHero>

      <Card>
        <div className="space-y-6 p-5">
          <RequisitesSection org={org} />
          <hr className="border-border" />
          <LocationSection org={org} />
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
      {dialog}
    </PageTransition>
  );
}

function OrgHeroContent({ org }: { org: OrgResponse }) {
  return (
    <div className="flex flex-wrap items-start gap-4">
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
  );
}

function RequisitesSection({ org }: { org: OrgResponse }) {
  return (
    <div>
      <SectionLabel icon={FileText}>Реквизиты</SectionLabel>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoBlock label="ИНН" icon={Hash} value={org.inn} mono />
        <InfoBlock label="Тип" icon={Building2} value={org.orgTypeName} />
      </div>
    </div>
  );
}

function LocationSection({ org }: { org: OrgResponse }) {
  const hasCoords = org.latitude != null && org.latitude !== 0 && org.longitude != null;

  return (
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
  );
}
