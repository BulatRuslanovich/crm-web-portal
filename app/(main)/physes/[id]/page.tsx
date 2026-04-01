'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { physesApi } from '@/lib/api/physes';
import { orgsApi } from '@/lib/api/orgs';
import { specsApi } from '@/lib/api/specs';
import type { PhysResponse, OrgResponse, SpecResponse } from '@/lib/api/types';
import { AxiosError } from 'axios';
import {
  BackButton, Card, CardFooter, CardSkeleton, Field,
  Label, Input, Select, ErrorBox, BtnPrimary, BtnSecondary, BtnDanger,
} from '@/components/ui';

export default function PhysDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [phys, setPhys] = useState<PhysResponse | null>(null);
  const [allOrgs, setAllOrgs] = useState<OrgResponse[]>([]);
  const [specs, setSpecs] = useState<SpecResponse[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ specId: '', lastName: '', firstName: '', middleName: '', phone: '', email: '', position: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const { data } = await physesApi.getById(Number(id));
      setPhys(data);
      setForm({
        specId: data.specId != null ? String(data.specId) : '',
        lastName: data.lastName,
        firstName: data.firstName ?? '',
        middleName: data.middleName ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
        position: data.position ?? '',
      });
    } catch { router.push('/physes'); }
  }

  useEffect(() => {
    load();
    orgsApi.getAll(1, 200).then(({ data }) => setAllOrgs(data.items));
    specsApi.getAll().then(({ data }) => setSpecs(data));
  }, [id]);

  if (!phys) return <div className="max-w-2xl mx-auto"><CardSkeleton /></div>;

  const fullName = [phys.lastName, phys.firstName, phys.middleName].filter(Boolean).join(' ');

  async function handleUpdate() {
    setError('');
    setSaving(true);
    try {
      await physesApi.update(Number(id), {
        specId: form.specId ? Number(form.specId) : null,
        lastName: form.lastName,
        firstName: form.firstName || null,
        middleName: form.middleName || null,
        phone: form.phone || null,
        email: form.email || null,
        position: form.position || null,
      });
      setEditing(false);
      await load();
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setError(e.response?.data?.message ?? 'Ошибка');
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm('Удалить врача?')) return;
    await physesApi.delete(Number(id));
    router.push('/physes');
  }

  async function toggleOrg(orgId: number) {
    if (!phys) return;
    const org = allOrgs.find((o) => o.orgId === orgId);
    if (!org) return;
    const linked = phys.orgs.includes(org.orgName);
    try {
      linked ? await physesApi.unlinkOrg(Number(id), orgId) : await physesApi.linkOrg(Number(id), orgId);
      await load();
    } catch { /* ignore */ }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <BackButton onClick={() => router.push('/physes')} />
        <h2 className="text-xl font-semibold text-(--fg) flex-1">{fullName}</h2>
        {phys.specName && (
          <span className="text-xs px-2.5 py-0.5 bg-(--surface-raised) border border-(--border) text-(--fg-muted) rounded-full">
            {phys.specName}
          </span>
        )}
      </div>

      {!editing ? (
        <>
          <Card>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Должность" value={phys.position} />
              <Field label="Телефон" value={phys.phone} />
              <Field label="Email" value={phys.email} />
              {phys.orgs.length > 0 && (
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-(--fg-muted) uppercase tracking-wide mb-1.5">Организации</p>
                  <div className="flex flex-wrap gap-1.5">
                    {phys.orgs.map((o) => (
                      <span key={o} className="text-xs px-2.5 py-0.5 bg-(--primary-subtle) text-(--primary-text) border border-(--primary-border) rounded-full">{o}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <CardFooter>
              <BtnDanger onClick={handleDelete}>Удалить</BtnDanger>
              <BtnSecondary onClick={() => setEditing(true)}>Редактировать</BtnSecondary>
            </CardFooter>
          </Card>

          {allOrgs.length > 0 && (
            <Card>
              <div className="px-5 py-3.5 border-b border-(--border)">
                <p className="text-sm font-semibold text-(--fg)">Организации</p>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto">
                {allOrgs.map((o) => (
                  <label key={o.orgId} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={phys.orgs.includes(o.orgName)}
                      onChange={() => toggleOrg(o.orgId)}
                      className="accent-(--primary)"
                    />
                    <span className="text-sm text-(--fg)">{o.orgName}</span>
                  </label>
                ))}
              </div>
            </Card>
          )}
        </>
      ) : (
        <form action={handleUpdate}>
          <Card>
            <div className="p-5 space-y-4">
              <div>
                <Label required>Фамилия</Label>
                <Input type="text" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Имя</Label>
                  <Input type="text" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
                </div>
                <div>
                  <Label>Отчество</Label>
                  <Input type="text" value={form.middleName} onChange={(e) => setForm((f) => ({ ...f, middleName: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Специальность</Label>
                <Select value={form.specId} onChange={(e) => setForm((f) => ({ ...f, specId: e.target.value }))}>
                  <option value="">Не указана</option>
                  {specs.map((s) => <option key={s.specId} value={s.specId}>{s.specName}</option>)}
                </Select>
              </div>
              <div>
                <Label>Должность</Label>
                <Input type="text" value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Телефон</Label>
                  <Input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
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
