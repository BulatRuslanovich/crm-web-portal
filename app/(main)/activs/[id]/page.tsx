'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { activsApi } from '@/lib/api/activs';
import { drugsApi } from '@/lib/api/drugs';
import { STATUSES, STATUS_PLANNED, STATUS_OPEN, STATUS_SAVED, STATUS_CLOSED } from '@/lib/api/statuses';
import { useAuth } from '@/lib/auth-context';
import type { ActivResponse, DrugResponse } from '@/lib/api/types';
import { AxiosError } from 'axios';
import {
  StatusBadge, BackButton, Card, CardFooter, CardSkeleton,
  Field, Label, Input, Select, Textarea, ErrorBox,
  BtnPrimary, BtnSecondary, BtnDanger,
} from '@/components/ui';
import { Lock, Play, Save, XCircle, Trash2, Pencil } from 'lucide-react';

export default function ActivDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.policies?.includes('Admin') ?? false;

  const [activ, setActiv] = useState<ActivResponse | null>(null);
  const [allDrugs, setAllDrugs] = useState<DrugResponse[]>([]);
  const [drugQuery, setDrugQuery] = useState('');
  const [editing, setEditing] = useState(false);
  const [adminForm, setAdminForm] = useState({ statusId: 1, start: '', end: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [acting, setActing] = useState(false);

  async function load() {
    try {
      const { data } = await activsApi.getById(Number(id));
      setActiv(data);
      setAdminForm({
        statusId: data.statusId,
        start: data.start ? data.start.slice(0, 16) : '',
        end:   data.end   ? data.end.slice(0, 16)   : '',
      });
    } catch {
      router.push('/activs');
    }
  }

  useEffect(() => {
    load();
    drugsApi.getAll(1, 200).then(({ data }) => setAllDrugs(data.items));
  }, [id]);

  if (!activ) return <div className="max-w-2xl mx-auto"><CardSkeleton /></div>;

  const isClosed  = activ.statusId === STATUS_CLOSED;
  const isLocked  = isClosed && !isAdmin;
  const canEdit   = isAdmin || (activ.usrId === user?.usrId && !isLocked);

  async function quickAction(statusId: number, extra: { start?: string; end?: string } = {}) {
    setActing(true);
    try {
      await activsApi.update(Number(id), {
        statusId,
        start: extra.start !== undefined ? extra.start : activ!.start,
        end:   extra.end   !== undefined ? extra.end   : activ!.end,
        description: activ!.description,
        result:      activ!.result,
      });
      await load();
    } catch { /* ignore */ }
    finally { setActing(false); }
  }

  function nowIso() {
    return new Date().toISOString();
  }

  async function handleUpdate(fd: FormData) {
    setError('');
    setSaving(true);
    try {
      await activsApi.update(Number(id), {
        statusId:    isAdmin ? adminForm.statusId : activ!.statusId,
        start:       isAdmin ? (adminForm.start || null) : activ!.start,
        end:         isAdmin ? (adminForm.end   || null) : activ!.end,
        description: (fd.get('description') as string) || null,
        result:      (fd.get('result')      as string) || null,
      });
      setEditing(false);
      await load();
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setError(e.response?.data?.message ?? 'Ошибка обновления');
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm('Удалить визит?')) return;
    await activsApi.delete(Number(id));
    router.push('/activs');
  }

  async function toggleDrug(drugId: number) {
    if (!activ) return;
    const drug = allDrugs.find((d) => d.drugId === drugId);
    if (!drug) return;
    const linked = activ.drugs.includes(drug.drugName);
    try {
      linked
        ? await activsApi.removeDrug(Number(id), drugId)
        : await activsApi.addDrug(Number(id), drugId);
      await load();
    } catch { /* ignore */ }
  }

  const filteredDrugs = allDrugs.filter(
    (d) => !drugQuery || d.drugName.toLowerCase().includes(drugQuery.toLowerCase()),
  );

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

      {!editing ? (
        <Card>
          <div className="p-5 grid grid-cols-2 gap-4">
            <Field label="Начало"    value={activ.start ? new Date(activ.start).toLocaleString('ru-RU') : null} />
            <Field label="Конец"     value={activ.end   ? new Date(activ.end).toLocaleString('ru-RU')   : null} />
            <Field label="Сотрудник" value={activ.usrLogin} />
            <Field label="Статус"    value={activ.statusName} />
            {activ.description && (
              <div className="col-span-2"><Field label="Описание" value={activ.description} /></div>
            )}
            {activ.result && (
              <div className="col-span-2"><Field label="Результат" value={activ.result} /></div>
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
                <BtnSecondary onClick={() => setEditing(true)}>
                  <Pencil size={14} /> Редактировать
                </BtnSecondary>
              )}
            </div>
          </CardFooter>
        </Card>
      ) : (
        <form action={handleUpdate}>
          <Card>
            <div className="p-5 space-y-4">
              {isAdmin && (
                <>
                  <div>
                    <Label>Статус</Label>
                    <Select
                      value={adminForm.statusId}
                      onChange={(e) => setAdminForm((f) => ({ ...f, statusId: Number(e.target.value) }))}
                    >
                      {STATUSES.map((s) => (
                        <option key={s.statusId} value={s.statusId}>{s.statusName}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Начало</Label>
                      <Input
                        type="datetime-local"
                        value={adminForm.start}
                        onChange={(e) => setAdminForm((f) => ({ ...f, start: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Конец</Label>
                      <Input
                        type="datetime-local"
                        value={adminForm.end}
                        onChange={(e) => setAdminForm((f) => ({ ...f, end: e.target.value }))}
                      />
                    </div>
                  </div>
                  <hr className="border-(--border)" />
                </>
              )}

              <div>
                <Label>Описание</Label>
                <Textarea name="description" rows={3} defaultValue={activ.description ?? ''} placeholder="Описание визита..." />
              </div>

              <div>
                <Label>Результат</Label>
                <Textarea name="result" rows={3} defaultValue={activ.result ?? ''} placeholder="Результат визита..." />
              </div>

              {allDrugs.length > 0 && (
                <div>
                  <Label>Препараты{activ.drugs.length > 0 && ` (${activ.drugs.length})`}</Label>
                  <div className="border border-(--border) rounded-xl overflow-hidden">
                    <div className="px-3 py-2 bg-(--surface-raised) border-b border-(--border)">
                      <input
                        type="text"
                        value={drugQuery}
                        onChange={(e) => setDrugQuery(e.target.value)}
                        placeholder="Поиск препарата..."
                        className="w-full bg-transparent text-sm text-(--fg) placeholder:text-(--fg-muted) focus:outline-none"
                      />
                    </div>
                    <div className="max-h-44 overflow-y-auto divide-y divide-(--border)">
                      {filteredDrugs.length === 0 ? (
                        <p className="px-3 py-3 text-sm text-(--fg-muted)">Ничего не найдено</p>
                      ) : filteredDrugs.map((d) => (
                        <label key={d.drugId} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-(--surface-raised)">
                          <input
                            type="checkbox"
                            checked={activ.drugs.includes(d.drugName)}
                            onChange={() => toggleDrug(d.drugId)}
                            className="accent-(--primary)"
                          />
                          <div>
                            <p className="text-sm text-(--fg)">{d.drugName}</p>
                            {d.brand && <p className="text-xs text-(--fg-muted)">{d.brand}</p>}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {error && <ErrorBox message={error} />}
            </div>

            <CardFooter>
              <BtnSecondary type="button" onClick={() => setEditing(false)}>Отмена</BtnSecondary>
              <BtnPrimary type="submit" disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</BtnPrimary>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}
