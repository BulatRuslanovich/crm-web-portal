'use client';

import { useState, useEffect, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/lib/use-api';
import { useSetDiff } from '@/lib/use-set-diff';
import { physesApi } from '@/lib/api/physes';
import { orgsApi } from '@/lib/api/orgs';
import { specsApi } from '@/lib/api/specs';
import type { OrgResponse } from '@/lib/api/types';
import { extractApiError } from '@/lib/api/errors';
import {
  BackButton,
  Card,
  CardFooter,
  CardSkeleton,
  Label,
  Input,
  Select,
  ErrorBox,
  BtnPrimary,
  BtnSecondary,
} from '@/components/ui';

export default function PhysEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [form, setForm] = useState({
    specId: '',
    lastName: '',
    firstName: '',
    middleName: '',
    phone: '',
    email: '',
    position: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState('');

  const numId = Number(id);
  const { data: phys, error: physError } = useApi(
    () => physesApi.getById(numId).then((r) => r.data),
    [],
  );

  useEffect(() => {
    if (physError) router.push('/physes');
  }, [physError, router]);

  useEffect(() => {
    if (!phys) return;
    setForm({
      specId: phys.specId != null ? String(phys.specId) : '',
      lastName: phys.lastName,
      firstName: phys.firstName ?? '',
      middleName: phys.middleName ?? '',
      phone: phys.phone ?? '',
      email: phys.email ?? '',
      position: phys.position ?? '',
    });
  }, [phys]);

  const { data: specs = [] } = useApi(() => specsApi.getAll().then(({ data }) => data), []);
  const { data: allOrgs = [] } = useApi(
    () => orgsApi.getAll(1, 1000).then(({ data }) => data.items),
    [],
  );

  const orgSourceIds = useMemo(
    () =>
      phys && allOrgs.length > 0
        ? allOrgs
            .filter((o: OrgResponse) => phys.orgs.includes(o.orgName))
            .map((o: OrgResponse) => o.orgId)
        : [],
    [phys, allOrgs],
  );
  const orgs = useSetDiff(orgSourceIds);

  if (!phys)
    return (
      <div className="mx-auto max-w-2xl">
        <CardSkeleton />
      </div>
    );

  const fullName = [phys.lastName, phys.firstName, phys.middleName].filter(Boolean).join(' ');
  const linkedOrgsList = allOrgs.filter((o: OrgResponse) => orgs.has(o.orgId));
  const availableOrgs = allOrgs.filter((o: OrgResponse) => !orgs.has(o.orgId));

  function handleAddOrg() {
    if (!selectedOrgId) return;
    orgs.add(Number(selectedOrgId));
    setSelectedOrgId('');
  }

  async function handleUpdate() {
    setError('');
    setSaving(true);
    try {
      await physesApi.update(numId, {
        specId: form.specId ? Number(form.specId) : null,
        lastName: form.lastName,
        firstName: form.firstName || null,
        middleName: form.middleName || null,
        phone: form.phone || null,
        email: form.email || null,
        position: form.position || null,
      });

      const { toAdd, toRemove } = orgs.diff();
      await Promise.all([
        ...toAdd.map((oid) => physesApi.linkOrg(numId, oid)),
        ...toRemove.map((oid) => physesApi.unlinkOrg(numId, oid)),
      ]);

      router.push(`/physes/${id}`);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <BackButton onClick={() => router.push(`/physes/${id}`)} />
        <h2 className="flex-1 text-xl font-semibold text-(--fg)">{fullName}</h2>
      </div>

      <form action={handleUpdate}>
        <Card>
          <div className="space-y-4 p-5">
            <div>
              <Label required>Фамилия</Label>
              <Input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label required>Имя</Label>
                <Input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label required>Отчество</Label>
                <Input
                  type="text"
                  value={form.middleName}
                  onChange={(e) => setForm((f) => ({ ...f, middleName: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Специальность</Label>
              <Select
                value={form.specId}
                onChange={(e) => setForm((f) => ({ ...f, specId: e.target.value }))}
              >
                <option value="">Не указана</option>
                {specs.map((s) => (
                  <option key={s.specId} value={s.specId}>
                    {s.specName}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Должность</Label>
              <Input
                type="text"
                value={form.position}
                onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Телефон</Label>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-wide text-(--fg-muted) uppercase">
                Организации
              </p>

              {linkedOrgsList.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {linkedOrgsList.map((o: OrgResponse) => (
                    <span
                      key={o.orgId}
                      className="inline-flex items-center gap-1.5 rounded-full border border-(--primary-border) bg-(--primary-subtle) px-2.5 py-1 text-xs text-(--primary-text)"
                    >
                      {o.orgName}
                      <button
                        type="button"
                        onClick={() => orgs.remove(o.orgId)}
                        className="cursor-pointer transition-colors hover:text-(--danger)"
                        title="Удалить связь"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-(--fg-muted)">Нет привязанных организаций</p>
              )}

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Select value={selectedOrgId} onChange={(e) => setSelectedOrgId(e.target.value)}>
                    <option value="">Выберите...</option>
                    {availableOrgs.map((o: OrgResponse) => (
                      <option key={o.orgId} value={o.orgId}>
                        {o.orgName}
                      </option>
                    ))}
                  </Select>
                </div>
                <BtnSecondary type="button" onClick={handleAddOrg} disabled={!selectedOrgId}>
                  Добавить
                </BtnSecondary>
              </div>
            </div>

            {error && <ErrorBox message={error} />}
          </div>
          <CardFooter>
            <BtnSecondary type="button" onClick={() => router.push(`/physes/${id}`)}>
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
