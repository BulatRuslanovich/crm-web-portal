'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { activsApi } from '@/lib/api/activs';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/use-api';
import { STATUS_PLANNED, STATUS_OPEN, STATUS_SAVED, STATUS_CLOSED } from '@/lib/api/statuses';
import {
  StatusBadge,
  BackButton,
  Card,
  CardFooter,
  CardSkeleton,
  Field,
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
} from 'lucide-react';
import { PageTransition } from '@/components/motion';

export default function ActivViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.policies?.includes('Admin') ?? false;
  const [acting, setActing] = useState(false);

  const numId = Number(id);
  const {
    data: activ,
    error: activError,
    reload,
  } = useApi(['activ', numId], () => activsApi.getById(numId).then((r) => r.data));

  useEffect(() => {
    if (activError) router.push('/activs');
  }, [activError, router]);

  if (!activ)
    return (
      <div className="mx-auto max-w-2xl">
        <CardSkeleton />
      </div>
    );

  const isClosed = activ.statusId === STATUS_CLOSED;
  const isLocked = isClosed && !isAdmin;
  const canEdit = isAdmin || (activ.usrId === user?.usrId && !isLocked);

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

  return (
    <PageTransition className="mx-auto max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <BackButton onClick={() => router.push('/activs')} />
        <h2 className="min-w-0 flex-1 truncate text-xl font-bold text-(--fg)">{activ.orgName}</h2>
        <StatusBadge name={activ.statusName} />
      </div>

      {/* Lock warning */}
      {isLocked && (
        <div className="animate-fade-in flex items-center gap-2.5 rounded-xl border border-(--warn-border) bg-(--warn-subtle) px-4 py-3 text-sm text-(--warn-text)">
          <Lock size={15} />
          <span>Визит закрыт — редактирование недоступно</span>
        </div>
      )}

      {/* Main card */}
      <Card>
        <div className="space-y-5 p-5">
          {/* Time section */}
          <div>
            <SectionLabel icon={Clock}>Время</SectionLabel>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Начало"
                value={activ.start ? new Date(activ.start).toLocaleString('ru-RU') : null}
              />
              <Field
                label="Конец"
                value={activ.end ? new Date(activ.end).toLocaleString('ru-RU') : null}
              />
            </div>
          </div>

          {/* Info section */}
          <div>
            <SectionLabel icon={User}>Информация</SectionLabel>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Сотрудник" value={activ.usrLogin} />
              <Field label="Статус" value={activ.statusName} />
            </div>
          </div>

          {/* Description */}
          {activ.description && (
            <div>
              <SectionLabel icon={FileText}>Описание</SectionLabel>
              <p className="rounded-xl bg-(--surface-raised) px-4 py-3 text-sm leading-relaxed text-(--fg)">
                {activ.description}
              </p>
            </div>
          )}

          {/* Drugs */}
          {activ.drugs.length > 0 && (
            <div>
              <SectionLabel icon={Pill}>Препараты</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {activ.drugs.map((d) => (
                  <span
                    key={d}
                    className="rounded-full border border-(--violet-border) bg-(--violet-subtle) px-3 py-1 text-xs font-medium text-(--violet-text)"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <CardFooter>
          <div className="flex-1">
            {isAdmin && (
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
