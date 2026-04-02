'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { activsApi } from '@/lib/api/activs';
import { orgsApi } from '@/lib/api/orgs';
import { drugsApi } from '@/lib/api/drugs';
import type { OrgResponse, DrugResponse } from '@/lib/api/types';
import { AxiosError } from 'axios';
import {
  BackButton, Card, CardFooter, Label, Input, Select,
  Textarea, ErrorBox, BtnSecondary, BtnSuccess,
} from '@/components/ui';
import { STATUS_PLANNED } from '@/lib/api/statuses';

export default function CreateActivPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<OrgResponse[]>([]);
  const [drugs, setDrugs] = useState<DrugResponse[]>([]);
  const [selectedDrugIds, setSelectedDrugIds] = useState<number[]>([]);
  const [drugQuery, setDrugQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    Promise.all([orgsApi.getAll(1, 200), drugsApi.getAll(1, 200)])
      .then(([o, d]) => { setOrgs(o.data.items); setDrugs(d.data.items); })
      .finally(() => setLoadingData(false));
  }, []);

  const filteredDrugs = drugs.filter(
    (d) => !drugQuery || d.drugName.toLowerCase().includes(drugQuery.toLowerCase()),
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <BackButton onClick={() => router.back()} />
        <h2 className="text-xl font-semibold text-(--fg)">Новый визит</h2>
      </div>

      <form
        action={async (fd: FormData) => {
          setError('');
          setLoading(true);
          try {
            const { data } = await activsApi.create({
              orgId: Number(fd.get('orgId')),
              statusId: STATUS_PLANNED,     // всегда «Запланирован»
              start: (fd.get('start') as string) || null,
              end: null,                    // дату окончания назначает только admin
              description: (fd.get('description') as string) || null,
              result: (fd.get('result') as string) || null,
              drugIds: selectedDrugIds,
            });
            router.push(`/activs/${data.activId}`);
          } catch (err) {
            const e = err as AxiosError<{ message?: string }>;
            setError(e.response?.data?.message ?? 'Ошибка создания визита');
          } finally {
            setLoading(false);
          }
        }}
      >
        <Card>
          <div className="p-4 space-y-4">
            {/* Организация */}
            <div>
              <Label required>Организация</Label>
              {loadingData ? (
                <div className="h-9 bg-(--surface-raised) border border-(--border) rounded-xl animate-pulse" />
              ) : (
                <Select name="orgId" required>
                  <option value="">Выберите организацию</option>
                  {orgs.map((o) => (
                    <option key={o.orgId} value={o.orgId}>{o.orgName}</option>
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

            {/* Результат */}
            <div>
              <Label>Результат</Label>
              <Textarea name="result" rows={3} placeholder="Результат визита..." />
            </div>

            {/* Препараты */}
            {drugs.length > 0 && (
              <div>
                <Label>Препараты{selectedDrugIds.length > 0 && ` (${selectedDrugIds.length})`}</Label>
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
                      <label
                        key={d.drugId}
                        className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-(--surface-raised)"
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
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && <ErrorBox message={error} />}
          </div>

          <CardFooter>
            <BtnSecondary type="button" onClick={() => router.back()}>Отмена</BtnSecondary>
            <BtnSuccess type="submit" disabled={loading || loadingData}>
              {loading ? 'Создание...' : 'Создать визит'}
            </BtnSuccess>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
