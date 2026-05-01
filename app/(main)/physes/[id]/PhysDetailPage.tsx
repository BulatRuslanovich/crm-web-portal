'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { BriefcaseMedical, Building2, Mail, Phone, Stethoscope } from 'lucide-react';
import { physesApi } from '@/lib/api/physes';
import { useEntity } from '@/lib/hooks/use-entity';
import { toast } from 'sonner';
import { useIsAdmin } from '@/lib/hooks/use-is-admin';
import type { PhysResponse } from '@/lib/api/types';
import { BackButton, Card, CardSkeleton, SectionLabel } from '@/components/ui';
import { PageTransition } from '@/components/motion';
import { ChipListSection } from '@/components/ChipListSection';
import { DetailHero } from '@/components/DetailHero';
import { EntityHistoryFeed } from '@/components/EntityHistoryFeed';
import { InfoBlock } from '@/components/InfoBlock';
import { AdminDetailFooter } from '@/components/AdminDetailFooter';
import { physFullName, physInitials } from '@/lib/initials';
import { useConfirm } from '@/components/ConfirmDialog';

const HERO_ACCENT = 'from-warning/20 via-warning/5 to-transparent';

export default function PhysDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  if (id === '-1') return <GetnamePage />;

  return <PhysDetailContent id={id} />;
}

function PhysDetailContent({ id }: { id: string }) {
  const { confirm, dialog } = useConfirm();
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const numId = Number(id);
  const { data: phys } = useEntity(['phys', numId], () => physesApi.getById(numId), '/physes');

  if (!phys) {
    return (
      <div className="mx-auto w-full">
        <CardSkeleton />
      </div>
    );
  }

  async function handleDelete() {
    const ok = await confirm({
      title: 'Удалить врача?',
      description: `Врач #${numId} будет удален безвозвратно.`,
      confirmLabel: 'Удалить',
    });
    if (!ok) return;

    await physesApi.delete(numId);
    toast('Врач удалён', {
      description: phys ? physFullName(phys.lastName, phys.firstName, phys.middleName) : undefined,
    });
    router.push('/physes');
  }

  return (
    <PageTransition className="mx-auto w-full space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <BackButton href="/physes" />
        <span className="text-muted-foreground ml-auto text-xs">#{phys.physId}</span>
      </div>

      <DetailHero accentGradient={HERO_ACCENT}>
        <PhysHeroContent phys={phys} />
      </DetailHero>

      <Card>
        <div className="space-y-6 p-5">
          <ContactsSection phys={phys} />
          {phys.orgs.length > 0 && (
            <ChipListSection
              icon={Building2}
              title="Организации"
              items={phys.orgs.map((o) => ({ key: o.orgId, label: o.orgName }))}
            />
          )}
          {isAdmin && (
            <>
              <hr className="border-border" />
              <EntityHistoryFeed entityType="phys" entityId={numId} />
            </>
          )}
        </div>

        <AdminDetailFooter
          show={isAdmin}
          onDelete={handleDelete}
          onEdit={() => router.push(`/physes/${id}/edit`)}
        />
      </Card>
      {dialog}
    </PageTransition>
  );
}

function PhysHeroContent({ phys }: { phys: PhysResponse }) {
  const fullName = physFullName(phys.lastName, phys.firstName, phys.middleName);
  const initials = physInitials(phys.lastName, phys.firstName);

  return (
    <div className="flex flex-wrap items-start gap-4">
      <div className="bg-card text-warning ring-warning/30 flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold ring-1">
        {initials || <Stethoscope size={20} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
          Врач
        </p>
        <h2 className="text-foreground truncate text-xl font-bold">{fullName}</h2>
        {phys.specName && (
          <div className="mt-2">
            <span className="border-border bg-muted/60 text-foreground inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium">
              <BriefcaseMedical size={11} className="text-muted-foreground" />
              {phys.specName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function ContactsSection({ phys }: { phys: PhysResponse }) {
  const phoneHref = phys.phone ? `tel:${phys.phone.replace(/\s/g, '')}` : undefined;
  const emailHref = phys.email ? `mailto:${phys.email}` : undefined;

  return (
    <div>
      <SectionLabel icon={Phone}>Контакты</SectionLabel>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoBlock label="Телефон" icon={Phone} value={phys.phone} href={phoneHref} />
        <InfoBlock label="Email" icon={Mail} value={phys.email} href={emailHref} />
      </div>
    </div>
  );
}

function GetnamePage() {
  return (
    <PageTransition className="mx-auto w-full space-y-4">
      <div className="flex items-center gap-2">
        <BackButton href="/physes" />
      </div>
      <DetailHero accentGradient="from-primary/20 via-primary/5 to-transparent">
        <div className="flex flex-wrap items-start gap-4">
          <div className="bg-card ring-primary/30 flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl ring-1">
            👾
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
              Разработчик
            </p>
            <h2 className="text-foreground text-xl font-bold">getname</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="border-border bg-muted/60 text-foreground inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium">
                <BriefcaseMedical size={11} className="text-muted-foreground" />
                Разработка ПО
              </span>
            </div>
          </div>
        </div>
      </DetailHero>
      <Card>
        <div className="space-y-4 p-5">
          <p className="text-muted-foreground font-mono text-sm italic">
            «Че ты тут забыл, ты либо автор этой х@йни, либо хакер, который получил исходники, а мб
            этот разраб открыл репу»
          </p>
        </div>
      </Card>
    </PageTransition>
  );
}
