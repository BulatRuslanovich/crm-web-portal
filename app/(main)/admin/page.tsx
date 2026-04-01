'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { usersApi } from '@/lib/api/users';
import { drugsApi } from '@/lib/api/drugs';
import { specsApi } from '@/lib/api/specs';
import type { UserResponse, DrugResponse, SpecResponse, PolicyResponse } from '@/lib/api/types';
import { AxiosError } from 'axios';
import {
  Card, CardSkeleton, Input, Label, ErrorBox,
  BtnSuccess, BtnDanger,
} from '@/components/ui';

type Tab = 'users' | 'drugs' | 'specs';

/* ── Users ── */
function UsersSection() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [policies, setPolicies] = useState<PolicyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const [u, p] = await Promise.all([usersApi.getAll(1, 100), usersApi.getPolicies()]);
    setUsers(u.data.items);
    setPolicies(p.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(fd: FormData) {
    setError('');
    try {
      await usersApi.create({
        login: fd.get('login') as string,
        password: fd.get('password') as string,
        firstName: (fd.get('firstName') as string) || null,
        lastName: (fd.get('lastName') as string) || null,
        email: (fd.get('email') as string) || null,
        phone: null,
        policyIds: [],
      });
      setShowCreate(false);
      await load();
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setError(e.response?.data?.message ?? 'Ошибка');
    }
  }

  async function togglePolicy(userId: number, policyId: number, has: boolean) {
    has ? await usersApi.unlinkPolicy(userId, policyId) : await usersApi.linkPolicy(userId, policyId);
    await load();
  }

  async function handleDelete(userId: number) {
    if (!confirm('Удалить пользователя?')) return;
    await usersApi.delete(userId);
    await load();
  }

  if (loading) return <CardSkeleton />;

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <BtnSuccess onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Отмена' : 'Добавить пользователя'}
        </BtnSuccess>
      </div>

      {showCreate && (
        <Card className="animate-fade-in">
          <form action={handleCreate}>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label required>Логин</Label><Input name="login" type="text" required /></div>
                <div><Label required>Пароль</Label><Input name="password" type="password" required /></div>
                <div><Label>Имя</Label><Input name="firstName" type="text" /></div>
                <div><Label>Фамилия</Label><Input name="lastName" type="text" /></div>
                <div className="sm:col-span-2"><Label>Email</Label><Input name="email" type="email" /></div>
              </div>
              {error && <ErrorBox message={error} />}
            </div>
            <div className="px-5 py-4 bg-(--surface-raised) border-t border-(--border) rounded-b-xl flex justify-end">
              <BtnSuccess type="submit">Создать</BtnSuccess>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="divide-y divide-(--border)">
          {users.map((u) => (
            <div key={u.usrId} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-(--fg) truncate">
                  {u.firstName ? `${u.firstName} ${u.lastName ?? ''}` : u.login}
                  <span className="text-(--fg-muted) font-normal ml-1">({u.login})</span>
                </p>
                <p className="text-xs text-(--fg-muted) mt-0.5">{u.email ?? '—'}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {u.policies.map((p) => (
                    <span key={p} className="text-xs px-1.5 py-0.5 bg-(--warn-subtle) text-(--warn-text) border border-(--warn-border) rounded">{p}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                {policies.map((pol) => (
                  <label key={pol.policyId} className="flex items-center gap-1.5 text-xs text-(--fg) cursor-pointer">
                    <input
                      type="checkbox"
                      checked={u.policies.includes(pol.policyName)}
                      onChange={() => togglePolicy(u.usrId, pol.policyId, u.policies.includes(pol.policyName))}
                      className="accent-(--primary)"
                    />
                    {pol.policyName}
                  </label>
                ))}
                <BtnDanger onClick={() => handleDelete(u.usrId)}>Удалить</BtnDanger>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ── Drugs ── */
function DrugsSection() {
  const [drugs, setDrugs] = useState<DrugResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await drugsApi.getAll(1, 200);
    setDrugs(data.items);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(fd: FormData) {
    setError('');
    try {
      await drugsApi.create({
        drugName: fd.get('drugName') as string,
        brand: (fd.get('brand') as string) || null,
        form: (fd.get('form') as string) || null,
        description: (fd.get('description') as string) || null,
      });
      setShowCreate(false);
      await load();
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setError(e.response?.data?.message ?? 'Ошибка');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить препарат?')) return;
    await drugsApi.delete(id);
    await load();
  }

  if (loading) return <CardSkeleton />;

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <BtnSuccess onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Отмена' : 'Добавить препарат'}
        </BtnSuccess>
      </div>

      {showCreate && (
        <Card className="animate-fade-in">
          <form action={handleCreate}>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label required>Название</Label><Input name="drugName" type="text" required /></div>
                <div><Label>Бренд</Label><Input name="brand" type="text" /></div>
                <div><Label>Форма</Label><Input name="form" type="text" /></div>
                <div><Label>Описание</Label><Input name="description" type="text" /></div>
              </div>
              {error && <ErrorBox message={error} />}
            </div>
            <div className="px-5 py-4 bg-(--surface-raised) border-t border-(--border) rounded-b-xl flex justify-end">
              <BtnSuccess type="submit">Создать</BtnSuccess>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="divide-y divide-(--border)">
          {drugs.map((d) => (
            <div key={d.drugId} className="px-5 py-3.5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-(--fg)">{d.drugName}</p>
                <p className="text-xs text-(--fg-muted) mt-0.5">{[d.brand, d.form].filter(Boolean).join(' · ') || '—'}</p>
              </div>
              <BtnDanger onClick={() => handleDelete(d.drugId)}>Удалить</BtnDanger>
            </div>
          ))}
          {drugs.length === 0 && <p className="px-5 py-6 text-sm text-(--fg-muted)">Препаратов пока нет</p>}
        </div>
      </Card>
    </div>
  );
}

/* ── Specs ── */
function SpecsSection() {
  const [specs, setSpecs] = useState<SpecResponse[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await specsApi.getAll();
    setSpecs(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(fd: FormData) {
    const name = (fd.get('specName') as string).trim();
    if (!name) return;
    await specsApi.create(name);
    await load();
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить специальность?')) return;
    await specsApi.delete(id);
    await load();
  }

  if (loading) return <CardSkeleton />;

  return (
    <div className="space-y-3">
      <form action={handleCreate} className="flex gap-2">
        <Input name="specName" type="text" placeholder="Новая специальность" required />
        <BtnSuccess type="submit">Добавить</BtnSuccess>
      </form>

      <Card>
        <div className="divide-y divide-(--border)">
          {specs.map((s) => (
            <div key={s.specId} className="px-5 py-3.5 flex items-center justify-between">
              <p className="text-sm text-(--fg)">{s.specName}</p>
              <BtnDanger onClick={() => handleDelete(s.specId)}>Удалить</BtnDanger>
            </div>
          ))}
          {specs.length === 0 && <p className="px-5 py-6 text-sm text-(--fg-muted)">Специальностей пока нет</p>}
        </div>
      </Card>
    </div>
  );
}

/* ── Page ── */
export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isAdmin = user?.policies?.includes('Admin');
  const [tab, setTab] = useState<Tab>('users');

  useEffect(() => {
    if (user && !isAdmin) router.push('/dashboard');
  }, [user, isAdmin]);

  if (!isAdmin) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'users', label: 'Пользователи' },
    { key: 'drugs', label: 'Препараты' },
    { key: 'specs', label: 'Специальности' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-(--fg) mb-5">Администрирование</h2>

      <div className="flex border-b border-(--border) mb-5 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors cursor-pointer ${
              tab === t.key
                ? 'border-(--primary) text-(--fg)'
                : 'border-transparent text-(--fg-muted) hover:text-(--fg) hover:border-(--border)'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'users' && <UsersSection />}
      {tab === 'drugs' && <DrugsSection />}
      {tab === 'specs' && <SpecsSection />}
    </div>
  );
}
