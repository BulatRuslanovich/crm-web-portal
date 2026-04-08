'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/lib/use-api';
import { activsApi } from '@/lib/api/activs';
import { orgsApi } from '@/lib/api/orgs';
import { drugsApi } from '@/lib/api/drugs';
import { extractApiError } from '@/lib/api/errors';
import {
  BackButton,
  Card,
  CardFooter,
  Label,
  Input,
  Select,
  Textarea,
  ErrorBox,
  BtnSecondary,
  BtnSuccess,
} from '@/components/ui';
import { STATUS_PLANNED } from '@/lib/api/statuses';

export default function CreateActivPage() {
  const router = useRouter();
  const { data: refData, loading: loadingData } = useApi(() =>
    Promise.all([orgsApi.getAll(), drugsApi.getAll()]).then(([o, d]) => ({
      orgs: o.data.items,
      drugs: d.data.items,
    })),
  );
  const orgs = refData?.orgs ?? [];
  const drugs = refData?.drugs ?? [];
  const [selectedDrugIds, setSelectedDrugIds] = useState<number[]>([]);
  const [drugQuery, setDrugQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredDrugs = drugs.filter(
    (d) => !drugQuery || d.drugName.toLowerCase().includes(drugQuery.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center gap-3">
        <BackButton onClick={() => router.back()} />
        <h2 className="text-xl font-semibold text-(--fg)">Новый визит</h2>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setError('');
          setLoading(true);
          try {
            const { data } = await activsApi.create({
              orgId: Number(fd.get('orgId')),
              statusId: STATUS_PLANNED,
              start: (fd.get('start') as string) || null,
              end: null,
              description: (fd.get('description') as string) || null,
              drugIds: selectedDrugIds,
            });
            router.push(`/activs/${data.activId}`);
          } catch (err) {
            setError(extractApiError(err, 'Ошибка создания визита'));
          } finally {
            setLoading(false);
          }
        }}
      >
        <Card>
          <div className="space-y-4 p-4">
            {/* Организация */}
            <div>
              <Label required>Организация</Label>
              {loadingData ? (
                <div className="h-9 animate-pulse rounded-xl border border-(--border) bg-(--surface-raised)" />
              ) : (
                <Select name="orgId" required>
                  <option value="">Выберите организацию</option>
                  {orgs.map((o) => (
                    <option key={o.orgId} value={o.orgId}>
                      {o.orgName}
                    </option>
                  ))}
                </Select>
              )}
            </div>

            {/* Дата начала */}
            <div>
              <Label>Дата начала</Label>
              <Input name="start" type="datetime-local" />
            </div>

            {/* Описание */}
            <div>
              <Label>Описание</Label>
              <Textarea name="description" rows={3} placeholder="Описание визита..." />
            </div>

            {/* Препараты */}
            {drugs.length > 0 && (
              <div>
                <Label>
                  Препараты{selectedDrugIds.length > 0 && ` (${selectedDrugIds.length})`}
                </Label>
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
                            checked={selectedDrugIds.includes(d.drugId)}
                            onChange={() =>
                              setSelectedDrugIds((prev) =>
                                prev.includes(d.drugId)
                                  ? prev.filter((x) => x !== d.drugId)
                                  : [...prev, d.drugId],
                              )
                            }
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
            <BtnSecondary type="button" onClick={() => router.back()}>
              Отмена
            </BtnSecondary>
            <BtnSuccess type="submit" disabled={loading || loadingData}>
              {loading ? 'Создание...' : 'Создать визит'}
            </BtnSuccess>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
