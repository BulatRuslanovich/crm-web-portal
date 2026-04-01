'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { orgsApi } from '@/lib/api/orgs';
import { useAuth } from '@/lib/auth-context';
import type { OrgResponse, OrgTypeResponse } from '@/lib/api/types';
import { AxiosError } from 'axios';
import {
  BackButton, Card, CardFooter, CardSkeleton, Field,
  Label, Input, Select, ErrorBox, BtnPrimary, BtnSecondary, BtnDanger,
} from '@/components/ui';

export default function OrgDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.policies?.includes('Admin');

  const [org, setOrg] = useState<OrgResponse | null>(null);
  const [types, setTypes] = useState<OrgTypeResponse[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ orgTypeId: '', orgName: '', inn: '', address: '', latitude: '', longitude: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const { data } = await orgsApi.getById(Number(id));
      setOrg(data);
      setForm({
        orgTypeId: String(data.orgTypeId),
        orgName: data.orgName,
        inn: data.inn ?? '',
        address: data.address ?? '',
        latitude: data.latitude != null ? String(data.latitude) : '',
        longitude: data.longitude != null ? String(data.longitude) : '',
      });
    } catch { router.push('/orgs'); }
  }

  useEffect(() => {
    load();
    orgsApi.getTypes().then(({ data }) => setTypes(data));
  }, [id]);

  if (!org) return <div className="max-w-2xl mx-auto"><CardSkeleton /></div>;

  async function handleUpdate() {
    setError('');
    setSaving(true);
    try {
      await orgsApi.update(Number(id), {
        orgTypeId: Number(form.orgTypeId),
        orgName: form.orgName,
        inn: form.inn || null,
        address: form.address || null,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      });
      setEditing(false);
      await load();
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setError(e.response?.data?.message ?? 'Ошибка обновления');
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm('Удалить организацию?')) return;
    await orgsApi.delete(Number(id));
    router.push('/orgs');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <BackButton onClick={() => router.push('/orgs')} />
        <h2 className="text-xl font-semibold text-(--fg) flex-1">{org.orgName}</h2>
        <span className="text-xs px-2.5 py-0.5 bg-(--surface-raised) border border-(--border) text-(--fg-muted) rounded-full">
          {org.orgTypeName}
        </span>
      </div>

      {!editing ? (
        <Card>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="ИНН" value={org.inn} />
            <Field label="Адрес" value={org.address} />
            {org.latitude != null && (
              <Field label="Координаты" value={`${org.latitude}, ${org.longitude}`} />
            )}
          </div>
          {isAdmin && (
            <CardFooter>
              <BtnDanger onClick={handleDelete}>Удалить</BtnDanger>
              <BtnSecondary onClick={() => setEditing(true)}>Редактировать</BtnSecondary>
            </CardFooter>
          )}
        </Card>
      ) : (
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
              <BtnSecondary type="button" onClick={() => setEditing(false)}>Отмена</BtnSecondary>
              <BtnPrimary type="submit" disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</BtnPrimary>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}
