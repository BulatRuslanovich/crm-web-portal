'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import {
  BriefcaseMedical,
  Building2,
  Mail,
  Pencil,
  Phone,
  Stethoscope,
  Trash2,
} from 'lucide-react';
import { physesApi } from '@/lib/api/physes';
import { useEntity } from '@/lib/hooks/use-entity';
import { toast } from 'sonner';
import { useIsAdmin } from '@/lib/hooks/use-is-admin';
import type { OrgResponse, PhysResponse } from '@/lib/api/types';
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
import { physFullName, physInitials } from '../../_lib/initials';
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
    toast('Врач удалён', { description: phys ? physFullName(phys.lastName, phys.firstName, phys.middleName) : undefined });
    router.push('/physes');
  }

  return (
    <PageTransition className="mx-auto w-full space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <BackButton href="/physes" />
        <span className="ml-auto text-xs text-muted-foreground">#{phys.physId}</span>
      </div>

      <DetailHero accentGradient={HERO_ACCENT}>
        <PhysHeroContent phys={phys} />
      </DetailHero>

      <Card>
        <div className="space-y-6 p-5">
          <ContactsSection phys={phys} />
          {phys.orgs.length > 0 && <OrgsSection orgs={phys.orgs} />}
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
      {dialog}
    </PageTransition>
  );
}

function PhysHeroContent({ phys }: { phys: PhysResponse }) {
  const fullName = physFullName(phys.lastName, phys.firstName, phys.middleName);
  const initials = physInitials(phys.lastName, phys.firstName);

  return (
    <div className="flex flex-wrap items-start gap-4">
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
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-card text-2xl ring-1 ring-primary/30">
            👾
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Разработчик
            </p>
            <h2 className="text-xl font-bold text-foreground">getname</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground">
                <BriefcaseMedical size={11} className="text-muted-foreground" />
                Разработка ПО
              </span>
            </div>
          </div>
        </div>
      </DetailHero>
      <Card>
        <div className="space-y-4 p-5">
          <p className="font-mono text-sm italic text-muted-foreground">
            «Че ты тут забыл, ты либо автор этой х@йни, либо хакер, который получил исходники, а мб этот разраб открыл репу»
          </p>
        </div>
      </Card>
   </PageTransition>
  );
}

function OrgsSection({ orgs }: { orgs: OrgResponse[] }) {
  return (
    <>
      <hr className="border-border" />
      <div>
        <SectionLabel icon={Building2}>
          Организации <span className="ml-1 text-muted-foreground/60">· {orgs.length}</span>
        </SectionLabel>
        <div className="flex flex-wrap gap-2">
          {orgs.map((o) => (
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
  );
}
