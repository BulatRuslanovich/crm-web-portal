'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, FileText, Lock, MapPin, Pill, Stethoscope, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { activsApi } from '@/lib/api/activs';
import { useAuth } from '@/lib/auth-context';
import { useEntity } from '@/lib/hooks/use-entity';
import { useRoles } from '@/lib/hooks/use-roles';
import { FINAL_STATUSES, STATUS_CANCELED, STATUS_OPEN, STATUS_SAVED } from '@/lib/api/statuses';
import {
  AlertBanner,
  BackButton,
  Card,
  CardFooter,
  CardSkeleton,
  SectionLabel,
  StatusBadge,
} from '@/components/ui';
import { PageTransition } from '@/components/motion';
import type { ActivResponse } from '@/lib/api/types';
import { ChipListSection } from '@/components/ChipListSection';
import { EntityHistoryFeed } from '@/components/EntityHistoryFeed';
import { InfoBlock } from '@/components/InfoBlock';
import { Hero } from '@/components/Hero';
import { StatusStepper } from '@/components/StatusStepper';
import { statusAccentGradient } from '@/lib/activ-helper';
import { TimeSection } from '@/components/TimeSection';
import { ActivQuickActions } from '@/components/ActivQuickActions';
import { toast } from 'sonner';
import { useActivActions } from '@/lib/use-activ-actions';
import { useConfirm } from '@/components/ConfirmDialog';

export default function DetailActivPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { isAdmin, canManageActivs } = useRoles();
  const { confirm, dialog } = useConfirm();

  const numId = Number(id);
  const { data: activ, reload } = useEntity(
    ['activ', numId],
    () => activsApi.getById(numId),
    '/activs',
  );

  const { acting, setStatus, closeWithGeo, geoDialog } = useActivActions({
    activ: activ ?? ({} as ActivResponse),
    reload,
  });

  if (!activ) {
    return (
      <div className="mx-auto w-full">
        <CardSkeleton />
      </div>
    );
  }

  const perms = resolvePermissions(activ, user?.usrId, isAdmin, canManageActivs);

  async function handleDelete() {
    const ok = await confirm({
      title: 'Удалить визит?',
      description: `Визит #${numId} будет удалён безвозвратно.`,
      confirmLabel: 'Удалить',
    });
    if (!ok) return;
    await activsApi.delete(numId);
    toast('Визит удалён', { description: `#${numId}` });
    router.push('/activs');
  }

  return (
    <PageTransition className="mx-auto w-full space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <BackButton href="/activs" />
        <span className="text-muted-foreground ml-auto text-xs">#{activ.activId}</span>
      </div>

      <Hero accentGradient={statusAccentGradient(activ.statusName)}>
        <ActivHeroContent activ={activ} />
      </Hero>

      {perms.isLocked && (
        <AlertBanner icon={Lock}>
          {activ.statusId === STATUS_CANCELED
            ? 'Визит отменён — редактирование недоступно'
            : 'Визит закрыт — редактирование недоступно'}
        </AlertBanner>
      )}

      <Card>
        <div className="space-y-6 p-5">
          <TimeSection start={activ.start} end={activ.end} />
          <hr className="border-border" />
          <InfoSection activ={activ} />
          {hasCoords(activ) && (
            <>
              <hr className="border-border" />
              <CoordsSection activ={activ} />
            </>
          )}
          {activ.description && <DescriptionSection description={activ.description} />}
          {activ.drugs.length > 0 && (
            <ChipListSection
              icon={Pill}
              title="Препараты"
              items={activ.drugs.map((d) => ({ key: d.drugId, label: d.drugName }))}
            />
          )}
          {isAdmin && (
            <>
              <hr className="border-border" />
              <EntityHistoryFeed entityType="activ" entityId={numId} />
            </>
          )}
        </div>

        <CardFooter>
          <ActivQuickActions
            statusId={activ.statusId}
            acting={acting}
            canEdit={perms.canEdit}
            canDelete={perms.canDelete}
            isLocked={perms.isLocked}
            onOpen={() => setStatus(STATUS_OPEN, { start: new Date().toISOString() })}
            onSave={() => setStatus(STATUS_SAVED)}
            onClose={closeWithGeo}
            onCancel={() => setStatus(STATUS_CANCELED, { end: new Date().toISOString() })}
            onEdit={() => router.push(`/activs/${id}/edit`)}
            onDelete={handleDelete}
          />
        </CardFooter>
      </Card>
      {dialog}
      {geoDialog}
    </PageTransition>
  );
}

function ActivHeroContent({ activ }: { activ: ActivResponse }) {
  const isPhys = activ.physId != null;
  const targetIcon: LucideIcon = isPhys ? Stethoscope : Building2;
  const targetName = (isPhys ? activ.physName : activ.orgName) ?? '—';
  const kindLabel = isPhys ? 'Врач' : 'Организация';
  const Icon = targetIcon;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="bg-card ring-border flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1">
            <Icon size={22} className="text-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
              {kindLabel}
            </p>
            <h2 className="text-foreground truncate text-xl font-bold">{targetName}</h2>
          </div>
        </div>
        <StatusBadge name={activ.statusName} />
      </div>

      <div className="mt-5">
        <StatusStepper currentStatusId={activ.statusId} />
      </div>
    </>
  );
}

function InfoSection({ activ }: { activ: ActivResponse }) {
  return (
    <div>
      <SectionLabel icon={User}>Информация</SectionLabel>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoBlock label="Сотрудник" icon={User} value={activ.usrLogin} />
        <InfoBlock label="Статус" value={activ.statusName} />
      </div>
    </div>
  );
}

function hasCoords(a: ActivResponse): boolean {
  return a.latitude != null && a.longitude != null;
}

function CoordsSection({ activ }: { activ: ActivResponse }) {
  const lat = activ.latitude!;
  const lng = activ.longitude!;
  const formatted = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  const osmHref = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
  return (
    <div>
      <SectionLabel icon={MapPin}>Координаты закрытия</SectionLabel>
      <div className="border-border bg-muted/40 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 text-sm">
        <span className="text-foreground font-mono">{formatted}</span>
        <a
          href={osmHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary text-xs font-semibold hover:underline"
        >
          Открыть на карте →
        </a>
      </div>
    </div>
  );
}

function DescriptionSection({ description }: { description: string }) {
  return (
    <>
      <hr className="border-border" />
      <div>
        <SectionLabel icon={FileText}>Описание</SectionLabel>
        <p className="border-border bg-muted/40 text-foreground rounded-xl border px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
          {description}
        </p>
      </div>
    </>
  );
}

interface Permissions {
  canEdit: boolean;
  canDelete: boolean;
  isLocked: boolean;
}

function resolvePermissions(
  activ: ActivResponse,
  currentUsrId: number | undefined,
  isAdmin: boolean,
  canManageActivs: boolean,
): Permissions {
  const isOwn = activ.usrId === currentUsrId;
  const isLocked = FINAL_STATUSES.has(activ.statusId) && !isAdmin;
  return {
    canEdit: (canManageActivs || isOwn) && !isLocked,
    canDelete: canManageActivs || isOwn,
    isLocked,
  };
}
