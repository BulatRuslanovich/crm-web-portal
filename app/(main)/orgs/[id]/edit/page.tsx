'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/lib/use-api';
import { useEntity } from '@/lib/use-entity';
import { orgsApi } from '@/lib/api/orgs';
import { extractApiError } from '@/lib/api/errors';
import {
  BackButton, Card, CardFooter, CardSkeleton,
  Label, Input, Select, ErrorBox, BtnPrimary, BtnSecondary,
} from '@/components/ui';

export default function OrgEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [form, setForm] = useState({ orgTypeId: '', orgName: '', inn: '', address: '', latitude: '', longitude: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: org, numId } = useEntity(orgsApi.getById, id, '/orgs', (data) => {
    setForm({
      orgTypeId: String(data.orgTypeId),
      orgName: data.orgName,
      inn: data.inn ?? '',
      address: data.address ?? '',
      latitude: data.latitude != null ? String(data.latitude) : '',
      longitude: data.longitude != null ? String(data.longitude) : '',
    });
  });

  const { data: types = [] } = useApi(() => orgsApi.getTypes().then(({ data }) => data), []);

  if (!org) return <div className="max-w-2xl mx-auto"><CardSkeleton /></div>;

  async function handleUpdate() {
    setError('');
    setSaving(true);
    try {
      await orgsApi.update(numId, {
        orgTypeId: Number(form.orgTypeId),
        orgName: form.orgName,
        inn: form.inn || null,
        address: form.address || null,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      });
      router.push(`/orgs/${id}`);
    } catch (err) {
      setError(extractApiError(err, 'Неизвестная ошибка при обновлении организации'));
    } finally { setSaving(false); }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <BackButton onClick={() => router.push(`/orgs/${id}`)} />
        <h2 className="text-xl font-semibold text-(--fg) flex-1">{org.orgName}</h2>
      </div>

      <form action={handleUpdate}>
        <Card>
          <div className="p-5 space-y-4">
            <div>
              <Label required>Тип</Label>
              <Select value={form.orgTypeId} onChange={(e) => setForm((f) => ({ ...f, orgTypeId: e.target.value }))}>
                {types.map((t) => <option key={t.orgTypeId} value={t.orgTypeId}>{t.orgTypeName}</option>)}
              </Select>
            </div>
            <div>
              <Label required>Название</Label>
              <Input type="text" value={form.orgName} onChange={(e) => setForm((f) => ({ ...f, orgName: e.target.value }))} required />
            </div>
            <div>
              <Label>ИНН</Label>
              <Input type="text" value={form.inn} onChange={(e) => setForm((f) => ({ ...f, inn: e.target.value }))} />
            </div>
            <div>
              <Label>Адрес</Label>
              <Input type="text" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Широта</Label>
                <Input type="number" step="any" value={form.latitude} onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))} />
              </div>
              <div>
                <Label>Долгота</Label>
                <Input type="number" step="any" value={form.longitude} onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))} />
              </div>
            </div>
            {error && <ErrorBox message={error} />}
          </div>
          <CardFooter>
            <BtnSecondary type="button" onClick={() => router.push(`/orgs/${id}`)}>Отмена</BtnSecondary>
            <BtnPrimary type="submit" disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</BtnPrimary>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
