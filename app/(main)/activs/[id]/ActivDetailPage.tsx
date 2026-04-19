'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Lock, Pill, User } from 'lucide-react';
import { activsApi } from '@/lib/api/activs';
import { useAuth } from '@/lib/auth-context';
import { useEntity } from '@/lib/hooks/use-entity';
import { useRoles } from '@/lib/hooks/use-roles';
import { STATUS_CLOSED, STATUS_OPEN, STATUS_SAVED } from '@/lib/api/statuses';
import {
  BackButton,
  Card,
  CardFooter,
  CardSkeleton,
  SectionLabel,
} from '@/components/ui';
import { PageTransition } from '@/components/motion';
import type { ActivResponse, DrugResponse } from '@/lib/api/types';
import { InfoBlock } from '../../_components/InfoBlock';
import { ActivHero } from './_components/ActivHero';
import { TimeSection } from './_components/TimeSection';
import { ActivQuickActions } from './_components/ActivQuickActions';
import { toast } from 'sonner';
import { nowIso, useActivActions } from './_lib/use-activ-actions';
import { useConfirm } from '@/components/ConfirmDialog';

export default function ActivDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { acting, setStatus } = useActivActions({
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
        <span className="ml-auto text-xs text-muted-foreground">#{activ.activId}</span>
      </div>

      <ActivHero activ={activ} />

      {perms.isLocked && <LockWarning />}

      <Card>
        <div className="space-y-6 p-5">
          <TimeSection start={activ.start} end={activ.end} />
          <hr className="border-border" />
          <InfoSection activ={activ} />
          {activ.description && <DescriptionSection description={activ.description} />}
          {activ.drugs.length > 0 && <DrugsSection drugs={activ.drugs} />}
        </div>

        <CardFooter>
          <ActivQuickActions
            statusId={activ.statusId}
            acting={acting}
            canEdit={perms.canEdit}
            canDelete={perms.canDelete}
            isLocked={perms.isLocked}
            onOpen={() => setStatus(STATUS_OPEN, { start: nowIso() })}
            onSave={() => setStatus(STATUS_SAVED)}
            onClose={() => setStatus(STATUS_CLOSED, { end: nowIso() })}
            onEdit={() => router.push(`/activs/${id}/edit`)}
            onDelete={handleDelete}
          />
        </CardFooter>
      </Card>
      {dialog}
    </PageTransition>
  );
}

function LockWarning() {
  return (
    <div className="animate-fade-in flex items-center gap-2.5 rounded-xl border border-warning/50 bg-warning/15 px-4 py-3 text-sm text-warning">
      <Lock size={15} />
      <span>Визит закрыт — редактирование недоступно</span>
    </div>
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

function DescriptionSection({ description }: { description: string }) {
  return (
    <>
      <hr className="border-border" />
      <div>
        <SectionLabel icon={FileText}>Описание</SectionLabel>
        <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
          {description}
        </p>
      </div>
    </>
  );
}

function DrugsSection({ drugs }: { drugs: DrugResponse[] }) {
  return (
    <>
      <hr className="border-border" />
      <div>
        <SectionLabel icon={Pill}>
          Препараты <span className="ml-1 text-muted-foreground/60">· {drugs.length}</span>
        </SectionLabel>
        <div className="flex flex-wrap gap-2">
          {drugs.map((d) => (
            <span
              key={d.drugId}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground"
            >
              <Pill size={11} className="text-muted-foreground" />
              {d.drugName}
            </span>
          ))}
        </div>
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
  const isLocked = activ.statusId === STATUS_CLOSED && !isAdmin;
  return {
    canEdit: (canManageActivs || isOwn) && !isLocked,
    canDelete: canManageActivs || isOwn,
    isLocked,
  };
}

