'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { activsApi } from '@/lib/api/activs';
import { useAuth } from '@/lib/auth-context';
import { useEntity } from '@/lib/use-entity';
import { useRoles } from '@/lib/use-roles';
import {
  STATUS_PLANNED,
  STATUS_OPEN,
  STATUS_SAVED,
  STATUS_CLOSED,
} from '@/lib/api/statuses';
import {
  StatusBadge,
  BackButton,
  Card,
  CardFooter,
  CardSkeleton,
  BtnPrimary,
  BtnSecondary,
  BtnDanger,
  SectionLabel,
} from '@/components/ui';
import {
  Lock,
  Play,
  Save,
  Trash2,
  Pencil,
  Sticker,
  Clock,
  User,
  FileText,
  Pill,
  Building2,
  Stethoscope,
  CalendarDays,
  Check,
} from 'lucide-react';
import { PageTransition } from '@/components/motion';

const STATUS_FLOW = [
  { id: STATUS_PLANNED, label: 'Запланирован' },
  { id: STATUS_OPEN, label: 'Открыт' },
  { id: STATUS_SAVED, label: 'Сохранен' },
  { id: STATUS_CLOSED, label: 'Закрыт' },
];

const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

function formatDateTime(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  const date = `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
  const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  return { date, time };
}

function formatDuration(start: string | null, end: string | null) {
  if (!start || !end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms <= 0) return null;
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} мин`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} ч` : `${h} ч ${m} мин`;
}

export default function ActivDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { isAdmin, canManageActivs } = useRoles();
  const [acting, setActing] = useState(false);

  const numId = Number(id);
  const { data: activ, reload } = useEntity(
    ['activ', numId],
    () => activsApi.getById(numId),
    '/activs',
  );

  if (!activ)
    return (
      <div className="mx-auto w-full">
        <CardSkeleton />
      </div>
    );

  const isOwn = activ.usrId === user?.usrId;
  const isClosed = activ.statusId === STATUS_CLOSED;
  const isLocked = isClosed && !isAdmin;
  const canEdit = (canManageActivs || isOwn) && !isLocked;
  const canDelete = canManageActivs || isOwn;
  const isPhys = activ.physId != null;
  const targetName = isPhys ? activ.physName : activ.orgName;
  const TargetIcon = isPhys ? Stethoscope : Building2;
  const targetKindLabel = isPhys ? 'Врач' : 'Организация';

  async function quickAction(statusId: number, extra: { start?: string; end?: string } = {}) {
    setActing(true);
    try {
      await activsApi.update(numId, {
        statusId,
        start: extra.start !== undefined ? extra.start : activ!.start,
        end: extra.end !== undefined ? extra.end : activ!.end,
        description: activ!.description,
      });
      await reload();
    } catch {
      /* ignore */
    } finally {
      setActing(false);
    }
  }

  function nowIso() {
    return new Date().toISOString();
  }

  async function handleDelete() {
    if (!confirm('Удалить визит?')) return;
    await activsApi.delete(numId);
    router.push('/activs');
  }

  const startFmt = formatDateTime(activ.start);
  const endFmt = formatDateTime(activ.end);
  const duration = formatDuration(activ.start, activ.end);

  const statusKey = activ.statusName.toLowerCase();
  const heroAccent =
    statusKey === 'запланирован'
      ? 'from-primary/15 via-primary/5 to-transparent'
      : statusKey === 'открыт'
        ? 'from-warning/20 via-warning/5 to-transparent'
        : statusKey === 'сохранен'
          ? 'from-muted-foreground/15 via-muted-foreground/5 to-transparent'
          : 'from-success/15 via-success/5 to-transparent';

  const currentStatusIdx = STATUS_FLOW.findIndex((s) => s.id === activ.statusId);

  return (
    <PageTransition className="mx-auto w-full space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-2">
        <BackButton href="/activs" />
        <span className="ml-auto text-xs text-muted-foreground">#{activ.activId}</span>
      </div>

      {/* Hero card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${heroAccent}`}
          aria-hidden
        />
        <div className="relative p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-card ring-1 ring-border">
                <TargetIcon size={22} className="text-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  {targetKindLabel}
                </p>
                <h2 className="truncate text-xl font-bold text-foreground">
                  {targetName ?? '—'}
                </h2>
              </div>
            </div>
            <StatusBadge name={activ.statusName} />
          </div>

          {/* Status stepper */}
          <div className="mt-5">
            <div className="flex items-center gap-1">
              {STATUS_FLOW.map((s, i) => {
                const reached = currentStatusIdx >= 0 && i <= currentStatusIdx;
                const isCurrent = s.id === activ.statusId;
                return (
                  <div key={s.id} className="flex flex-1 items-center gap-1">
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                          isCurrent
                            ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                            : reached
                              ? 'bg-primary/80 text-primary-foreground'
                              : 'bg-muted text-muted-foreground/60'
                        }`}
                      >
                        {reached && !isCurrent ? <Check size={11} /> : i + 1}
                      </div>
                      <span
                        className={`text-[10px] font-medium whitespace-nowrap ${
                          reached ? 'text-foreground' : 'text-muted-foreground/70'
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {i < STATUS_FLOW.length - 1 && (
                      <div
                        className={`mb-5 h-0.5 flex-1 rounded-full transition-colors ${
                          i < currentStatusIdx ? 'bg-primary/70' : 'bg-border'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Lock warning */}
      {isLocked && (
        <div className="animate-fade-in flex items-center gap-2.5 rounded-xl border border-warning/50 bg-warning/15 px-4 py-3 text-sm text-warning">
          <Lock size={15} />
          <span>Визит закрыт — редактирование недоступно</span>
        </div>
      )}

      {/* Main card */}
      <Card>
        <div className="space-y-6 p-5">
          {/* Time */}
          <div>
            <SectionLabel icon={Clock}>Время визита</SectionLabel>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TimeBlock label="Начало" icon={CalendarDays} value={startFmt} />
              <TimeBlock label="Окончание" icon={CalendarDays} value={endFmt} />
            </div>
            {duration && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                <Clock size={11} />
                Длительность: {duration}
              </div>
            )}
          </div>

          <hr className="border-border" />

          {/* Info */}
          <div>
            <SectionLabel icon={User}>Информация</SectionLabel>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoPill label="Сотрудник" value={activ.usrLogin} icon={User} />
              <InfoPill label="Статус" value={activ.statusName} />
            </div>
          </div>

          {/* Description */}
          {activ.description && (
            <>
              <hr className="border-border" />
              <div>
                <SectionLabel icon={FileText}>Описание</SectionLabel>
                <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                  {activ.description}
                </p>
              </div>
            </>
          )}

          {/* Drugs */}
          {activ.drugs.length > 0 && (
            <>
              <hr className="border-border" />
              <div>
                <SectionLabel icon={Pill}>
                  Препараты <span className="ml-1 text-muted-foreground/60">· {activ.drugs.length}</span>
                </SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {activ.drugs.map((d) => (
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
          )}
        </div>

        <CardFooter>
          <div className="flex-1">
            {canDelete && (
              <BtnDanger onClick={handleDelete}>
                <Trash2 size={14} /> Удалить
              </BtnDanger>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {activ.statusId === STATUS_PLANNED && !isLocked && (
              <BtnPrimary
                onClick={() => quickAction(STATUS_OPEN, { start: nowIso() })}
                disabled={acting}
              >
                <Play size={14} /> Открыть визит
              </BtnPrimary>
            )}

            {activ.statusId === STATUS_OPEN && !isLocked && (
              <>
                <BtnSecondary onClick={() => quickAction(STATUS_SAVED)} disabled={acting}>
                  <Save size={14} /> Сохранить
                </BtnSecondary>
                <BtnPrimary
                  onClick={() => quickAction(STATUS_CLOSED, { end: nowIso() })}
                  disabled={acting}
                >
                  <Sticker size={14} /> Закрыть
                </BtnPrimary>
              </>
            )}

            {canEdit && (
              <BtnSecondary onClick={() => router.push(`/activs/${id}/edit`)}>
                <Pencil size={14} /> Редактировать
              </BtnSecondary>
            )}
          </div>
        </CardFooter>
      </Card>
    </PageTransition>
  );
}

function TimeBlock({
  label,
  icon: Icon,
  value,
}: {
  label: string;
  icon: React.ElementType;
  value: { date: string; time: string } | null;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card ring-1 ring-border">
        <Icon size={15} className="text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          {label}
        </p>
        {value ? (
          <p className="text-sm font-semibold text-foreground">
            {value.date}
            <span className="ml-1.5 font-mono text-muted-foreground">{value.time}</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground/70">—</p>
        )}
      </div>
    </div>
  );
}

function InfoPill({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | null | undefined;
  icon?: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
      <p className="mb-0.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </p>
      <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        {Icon && <Icon size={12} className="text-muted-foreground" />}
        {value || <span className="text-muted-foreground/70">—</span>}
      </p>
    </div>
  );
}
