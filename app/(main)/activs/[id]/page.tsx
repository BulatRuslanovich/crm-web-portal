'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { activsApi } from '@/lib/api/activs';
import { useAuth } from '@/lib/auth-context';
import { useEntity } from '@/lib/use-entity';
import { STATUS_PLANNED, STATUS_OPEN, STATUS_SAVED, STATUS_CLOSED } from '@/lib/api/statuses';
import {
  StatusBadge, BackButton, Card, CardFooter, CardSkeleton, Field,
  BtnPrimary, BtnSecondary, BtnDanger,
} from '@/components/ui';
import { Lock, Play, Save, XCircle, Trash2, Pencil } from 'lucide-react';

export default function ActivViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.policies?.includes('Admin') ?? false;
  const [acting, setActing] = useState(false);

  const { data: activ, numId, reload } = useEntity(activsApi.getById, id, '/activs');

  if (!activ) return <div className="max-w-2xl mx-auto"><CardSkeleton /></div>;

  const isClosed = activ.statusId === STATUS_CLOSED;
  const isLocked = isClosed && !isAdmin;
  const canEdit  = isAdmin || (activ.usrId === user?.usrId && !isLocked);

  async function quickAction(statusId: number, extra: { start?: string; end?: string } = {}) {
    setActing(true);
    try {
      await activsApi.update(numId, {
        statusId,
        start: extra.start !== undefined ? extra.start : activ!.start,
        end:   extra.end   !== undefined ? extra.end   : activ!.end,
        description: activ!.description,
      });
      await reload();
    } catch { /* ignore */ }
    finally { setActing(false); }
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
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <BackButton onClick={() => router.push('/activs')} />
        <h2 className="text-xl font-semibold text-(--fg) flex-1 min-w-0 truncate">{activ.orgName}</h2>
        <StatusBadge name={activ.statusName} />
      </div>

      {isLocked && (
        <div className="flex items-center gap-2 px-4 py-3 bg-(--warn-subtle) border border-(--warn-border) rounded-xl text-sm text-(--warn-text) animate-fade-in">
          <Lock size={14} />
          Визит закрыт — редактирование недоступно
        </div>
      )}

      <Card>
        <div className="p-5 grid grid-cols-2 gap-4">
          <Field label="Начало"    value={activ.start ? new Date(activ.start).toLocaleString('ru-RU') : null} />
          <Field label="Конец"     value={activ.end   ? new Date(activ.end).toLocaleString('ru-RU')   : null} />
          <Field label="Сотрудник" value={activ.usrLogin} />
          <Field label="Статус"    value={activ.statusName} />
          {activ.description && (
            <div className="col-span-2"><Field label="Описание" value={activ.description} /></div>
          )}
          {activ.drugs.length > 0 && (
            <div className="col-span-2">
              <p className="text-xs font-semibold text-(--fg-muted) uppercase tracking-wide mb-1.5">Препараты</p>
              <div className="flex flex-wrap gap-1.5">
                {activ.drugs.map((d) => (
                  <span key={d} className="text-xs px-2.5 py-0.5 bg-(--violet-subtle) text-(--violet-text) border border-(--violet-border) rounded-full">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <CardFooter>
          <div className="flex-1">
            {isAdmin && (
              <BtnDanger onClick={handleDelete}>
                <Trash2 size={14} /> Удалить
              </BtnDanger>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {activ.statusId === STATUS_PLANNED && !isLocked && (
              <BtnPrimary onClick={() => quickAction(STATUS_OPEN, { start: nowIso() })} disabled={acting}>
                <Play size={14} /> Открыть визит
              </BtnPrimary>
            )}

            {activ.statusId === STATUS_OPEN && !isLocked && (
              <>
                <BtnSecondary onClick={() => quickAction(STATUS_SAVED)} disabled={acting}>
                  <Save size={14} /> Сохранить
                </BtnSecondary>
                <BtnDanger onClick={() => quickAction(STATUS_CLOSED, { end: nowIso() })} disabled={acting}>
                  <XCircle size={14} /> Закрыть
                </BtnDanger>
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
    </div>
  );
}
