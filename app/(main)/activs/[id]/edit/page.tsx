'use client';

import { useState, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/lib/use-api';
import { useEntity } from '@/lib/use-entity';
import { useSetDiff } from '@/lib/use-set-diff';
import { activsApi } from '@/lib/api/activs';
import { drugsApi } from '@/lib/api/drugs';
import { STATUSES } from '@/lib/api/statuses';
import { useAuth } from '@/lib/auth-context';
import { extractApiError } from '@/lib/api/errors';
import {
  BackButton,
  Card,
  CardFooter,
  CardSkeleton,
  Label,
  Input,
  Select,
  Textarea,
  ErrorBox,
  BtnPrimary,
  BtnSecondary,
} from '@/components/ui';

export default function ActivEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.policies?.includes('Admin') ?? false;

  const [adminForm, setAdminForm] = useState({ statusId: 1, start: '', end: '' });
  const [description, setDescription] = useState('');
  const [drugQuery, setDrugQuery] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: activ, numId } = useEntity(activsApi.getById, id, '/activs', (data) => {
    setAdminForm({
      statusId: data.statusId,
      start: data.start ? data.start.slice(0, 16) : '',
      end: data.end ? data.end.slice(0, 16) : '',
    });
    setDescription(data.description ?? '');
  });

  const { data: allDrugs = [] } = useApi(
    () => drugsApi.getAll(1, 200).then(({ data }) => data.items),
    [],
  );

  const drugSourceIds = useMemo(
    () =>
      activ && allDrugs.length > 0
        ? allDrugs.filter((d) => activ.drugs.includes(d.drugName)).map((d) => d.drugId)
        : [],
    [activ, allDrugs],
  );
  const drugs = useSetDiff(drugSourceIds);

  if (!activ)
    return (
      <div className="mx-auto max-w-2xl">
        <CardSkeleton />
      </div>
    );

  const filteredDrugs = allDrugs.filter(
    (d) => !drugQuery || d.drugName.toLowerCase().includes(drugQuery.toLowerCase()),
  );

  async function handleUpdate() {
    setError('');
    setSaving(true);
    try {
      await activsApi.update(numId, {
        statusId: isAdmin ? adminForm.statusId : activ!.statusId,
        start: isAdmin ? adminForm.start || null : activ!.start,
        end: isAdmin ? adminForm.end || null : activ!.end,
        description: description || null,
      });

      const { toAdd, toRemove } = drugs.diff();
      await Promise.all([
        ...toAdd.map((did) => activsApi.addDrug(numId, did)),
        ...toRemove.map((did) => activsApi.removeDrug(numId, did)),
      ]);

      router.push(`/activs/${id}`);
    } catch (err) {
      setError(extractApiError(err, 'Ошибка обновления'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <BackButton onClick={() => router.push(`/activs/${id}`)} />
        <h2 className="min-w-0 flex-1 truncate text-xl font-semibold text-(--fg)">
          {activ.orgName}
        </h2>
      </div>

      <form action={handleUpdate}>
        <Card>
          <div className="space-y-4 p-5">
            {isAdmin && (
              <>
                <div>
                  <Label>Статус</Label>
                  <Select
                    value={adminForm.statusId}
                    onChange={(e) =>
                      setAdminForm((f) => ({ ...f, statusId: Number(e.target.value) }))
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s.statusId} value={s.statusId}>
                        {s.statusName}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Описание визита..."
              />
            </div>

            {allDrugs.length > 0 && (
              <div>
                <Label>Препараты{drugs.size > 0 && ` (${drugs.size})`}</Label>
                <div className="overflow-hidden rounded-xl border border-(--border)">
                  <div className="border-b border-(--border) bg-(--surface-raised) px-3 py-2">
                    <input
                      type="text"
                      value={drugQuery}
                      onChange={(e) => setDrugQuery(e.target.value)}
                      placeholder="Поиск препарата..."
                      className="w-full bg-transparent text-sm text-(--fg) placeholder:text-(--fg-muted) focus:outline-none"
                    />
                  </div>
                  <div className="max-h-44 divide-y divide-(--border) overflow-y-auto">
                    {filteredDrugs.length === 0 ? (
                      <p className="px-3 py-3 text-sm text-(--fg-muted)">Ничего не найдено</p>
                    ) : (
                      filteredDrugs.map((d) => (
                        <label
                          key={d.drugId}
                          className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-(--surface-raised)"
                        >
                          <input
                            type="checkbox"
                            checked={drugs.has(d.drugId)}
                            onChange={() => drugs.toggle(d.drugId)}
                            className="accent-(--primary)"
                          />
                          <div>
                            <p className="text-sm text-(--fg)">{d.drugName}</p>
                            {d.brand && <p className="text-xs text-(--fg-muted)">{d.brand}</p>}
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {error && <ErrorBox message={error} />}
          </div>

          <CardFooter>
            <BtnSecondary type="button" onClick={() => router.push(`/activs/${id}`)}>
              Отмена
            </BtnSecondary>
            <BtnPrimary type="submit" disabled={saving}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </BtnPrimary>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
