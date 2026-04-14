'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/use-api';
import { usersApi } from '@/lib/api/users';
import { drugsApi } from '@/lib/api/drugs';
import { specsApi } from '@/lib/api/specs';
import { extractApiError } from '@/lib/api/errors';
import { Card, CardSkeleton, Input, Label, ErrorBox, BtnSuccess, BtnDanger } from '@/components/ui';
import { PageTransition } from '@/components/motion';
import { ShieldCheck, Users, Pill, GraduationCap, Plus, X } from 'lucide-react';

type Tab = 'users' | 'drugs' | 'specs';

function UsersSection() {
  const { data, loading, reload } = useApi(
    'admin-users',
    () =>
      Promise.all([usersApi.getAll(), usersApi.getPolicies()]).then(([u, p]) => ({
        users: u.data.items,
        policies: p.data,
      })),
  );
  const users = data?.users ?? [];
  const policies = data?.policies ?? [];
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate(fd: FormData) {
    setError('');
    try {
      await usersApi.create({
        login: fd.get('login') as string,
        password: fd.get('password') as string,
        firstName: (fd.get('firstName') as string) || '',
        lastName: (fd.get('lastName') as string) || '',
        email: (fd.get('email') as string) || '',
        phone: '',
        policyIds: [],
      });
      setShowCreate(false);
      await reload();
    } catch (err) {
      setError(extractApiError(err));
    }
  }

  async function togglePolicy(userId: number, policyId: number, has: boolean) {
    if (has) {
      await usersApi.unlinkPolicy(userId, policyId);
    } else {
      await usersApi.linkPolicy(userId, policyId);
    }
    await reload();
  }

  async function handleDelete(userId: number) {
    if (!confirm('Удалить пользователя?')) return;
    await usersApi.delete(userId);
    await reload();
  }

  if (loading) return <CardSkeleton />;

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <BtnSuccess onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? (
            <>
              <X size={14} /> Отмена
            </>
          ) : (
            <>
              <Plus size={14} /> Добавить пользователя
            </>
          )}
        </BtnSuccess>
      </div>

      {showCreate && (
        <Card className="animate-fade-in">
          <form action={handleCreate}>
            <div className="space-y-3 p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label required>Логин</Label>
                  <Input name="login" type="text" required />
                </div>
                <div>
                  <Label required>Пароль</Label>
                  <Input name="password" type="password" required />
                </div>
                <div>
                  <Label>Имя</Label>
                  <Input name="firstName" type="text" />
                </div>
                <div>
                  <Label>Фамилия</Label>
                  <Input name="lastName" type="text" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Email</Label>
                  <Input name="email" type="email" />
                </div>
              </div>
              {error && <ErrorBox message={error} />}
            </div>
            <div className="flex justify-end rounded-b-2xl border-t border-(--border) bg-(--surface-raised)/50 px-5 py-4">
              <BtnSuccess type="submit">Создать</BtnSuccess>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="divide-y divide-(--border)">
          {users.map((u) => (
            <div
              key={u.usrId}
              className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-(--fg)">
                  {u.firstName ? `${u.firstName} ${u.lastName ?? ''}` : u.login}
                  <span className="ml-1.5 font-normal text-(--fg-muted)">({u.login})</span>
                </p>
                <p className="mt-0.5 text-xs text-(--fg-muted)">{u.email ?? '---'}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {u.policies.map((p) => (
                    <span
                      key={p}
                      className="rounded-full border border-(--warn-border) bg-(--warn-subtle) px-2 py-0.5 text-xs font-medium text-(--warn-text)"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                {policies.map((pol) => (
                  <label
                    key={pol.policyId}
                    className="flex cursor-pointer items-center gap-1.5 text-xs text-(--fg)"
                  >
                    <input
                      type="checkbox"
                      checked={u.policies.includes(pol.policyName)}
                      onChange={() =>
                        togglePolicy(u.usrId, pol.policyId, u.policies.includes(pol.policyName))
                      }
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

function DrugsSection() {
  const {
    data: drugs = [],
    loading,
    reload,
  } = useApi('admin-drugs', () => drugsApi.getAll(1, 200).then(({ data }) => data.items));
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate(fd: FormData) {
    setError('');
    try {
      await drugsApi.create({
        drugName: fd.get('drugName') as string,
        brand: fd.get('brand') as string,
        form: fd.get('form') as string,
      });
      setShowCreate(false);
      await reload();
    } catch (err) {
      setError(extractApiError(err));
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить препарат?')) return;
    await drugsApi.delete(id);
    await reload();
  }

  if (loading) return <CardSkeleton />;

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <BtnSuccess onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? (
            <>
              <X size={14} /> Отмена
            </>
          ) : (
            <>
              <Plus size={14} /> Добавить препарат
            </>
          )}
        </BtnSuccess>
      </div>

      {showCreate && (
        <Card className="animate-fade-in">
          <form action={handleCreate}>
            <div className="space-y-3 p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label required>Название</Label>
                  <Input name="drugName" type="text" required />
                </div>
                <div>
                  <Label required>Бренд</Label>
                  <Input name="brand" type="text" required />
                </div>
                <div>
                  <Label required>Форма</Label>
                  <Input name="form" type="text" required />
                </div>
              </div>
              {error && <ErrorBox message={error} />}
            </div>
            <div className="flex justify-end rounded-b-2xl border-t border-(--border) bg-(--surface-raised)/50 px-5 py-4">
              <BtnSuccess type="submit">Создать</BtnSuccess>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="divide-y divide-(--border)">
          {drugs.map((d) => (
            <div key={d.drugId} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-(--fg)">{d.drugName}</p>
                <p className="mt-0.5 text-xs text-(--fg-muted)">
                  {[d.brand, d.form].filter(Boolean).join(' · ') || '---'}
                </p>
              </div>
              <BtnDanger onClick={() => handleDelete(d.drugId)}>Удалить</BtnDanger>
            </div>
          ))}
          {drugs.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-(--fg-muted)">Препаратов пока нет</p>
          )}
        </div>
      </Card>
    </div>
  );
}

function SpecsSection() {
  const {
    data: specs = [],
    loading,
    reload,
  } = useApi('admin-specs', () => specsApi.getAll().then(({ data }) => data));

  async function handleCreate(fd: FormData) {
    const name = (fd.get('specName') as string).trim();
    if (!name) return;
    await specsApi.create(name);
    await reload();
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить специальность?')) return;
    await specsApi.delete(id);
    await reload();
  }

  if (loading) return <CardSkeleton />;

  return (
    <div className="space-y-3">
      <form action={handleCreate} className="flex gap-2">
        <Input name="specName" type="text" placeholder="Новая специальность" required />
        <BtnSuccess type="submit">
          <Plus size={14} /> Добавить
        </BtnSuccess>
      </form>

      <Card>
        <div className="divide-y divide-(--border)">
          {specs.map((s) => (
            <div key={s.specId} className="flex items-center justify-between px-5 py-4">
              <p className="text-sm font-medium text-(--fg)">{s.specName}</p>
              <BtnDanger onClick={() => handleDelete(s.specId)}>Удалить</BtnDanger>
            </div>
          ))}
          {specs.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-(--fg-muted)">
              Специальностей пока нет
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isAdmin = user?.policies?.includes('Admin');
  const [tab, setTab] = useState<Tab>('users');

  useEffect(() => {
    if (user && !isAdmin) router.push('/dashboard');
  }, [user, isAdmin, router]);

  if (!isAdmin) return null;

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'users', label: 'Пользователи', icon: Users },
    { key: 'drugs', label: 'Препараты', icon: Pill },
    { key: 'specs', label: 'Специальности', icon: GraduationCap },
  ];

  return (
    <PageTransition className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--violet-subtle)">
          <ShieldCheck size={18} className="text-(--violet-text)" />
        </div>
        <h2 className="text-xl font-bold text-(--fg)">Администрирование</h2>
      </div>

      <div className="mb-5 flex gap-1 rounded-xl border border-(--border) bg-(--surface-raised) p-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                tab === t.key
                  ? 'bg-(--surface) text-(--fg) shadow-sm'
                  : 'text-(--fg-muted) hover:text-(--fg)'
              }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {tab === 'users' && <UsersSection />}
      {tab === 'drugs' && <DrugsSection />}
      {tab === 'specs' && <SpecsSection />}
    </PageTransition>
  );
}
