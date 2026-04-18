import { useState, useMemo } from 'react';
import { useApi } from '@/lib/use-api';
import { usersApi } from '@/lib/api/users';
import { extractApiError } from '@/lib/api/errors';
import {
  CardSkeleton,
  Input,
  Label,
  ErrorBox,
  BtnSuccess,
  BtnSecondary,
  Pagination,
} from '@/components/ui';
import { Plus, X, Mail, AtSign, Trash2, UserPlus2, ShieldCheck } from 'lucide-react';
import { SearchInput } from './SearchInput';

const POLICY_LABEL: Record<string, string> = {
  Admin: 'Админ',
  Director: 'Руководитель',
  Manager: 'Менеджер',
  User: 'Сотрудник',
};

function policyTone(policy: string): string {
  switch (policy) {
    case 'Admin':
      return 'border-warning/40 bg-warning/15 text-warning';
    case 'Director':
      return 'border-primary/40 bg-primary/10 text-primary';
    case 'Manager':
      return 'border-success/40 bg-success/10 text-success';
    default:
      return 'border-border bg-muted text-muted-foreground';
  }
}

function initialsOf(u: { firstName: string | null; lastName: string | null; login: string }) {
  const fl = (u.firstName?.[0] ?? '') + (u.lastName?.[0] ?? '');
  return (fl || u.login.slice(0, 2)).toUpperCase();
}

export function UsersSection() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const pageSize = 20;

  const { data, loading, reload } = useApi(
    ['admin-users', page],
    () =>
      Promise.all([usersApi.getAll(page, pageSize), usersApi.getPolicies()]).then(([u, p]) => ({
        users: u.data.items,
        totalPages: u.data.totalPages,
        policies: p.data,
      })),
    { keepPreviousData: true },
  );
  const policies = data?.policies ?? [];
  const totalPages = data?.totalPages ?? 0;

  const users = useMemo(() => {
    const all = data?.users ?? [];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter(
      (u) =>
        u.login.toLowerCase().includes(q) ||
        (u.firstName ?? '').toLowerCase().includes(q) ||
        (u.lastName ?? '').toLowerCase().includes(q) ||
        (u.email ?? '').toLowerCase().includes(q),
    );
  }, [data?.users, search]);

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
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Поиск по логину, имени, email…" />
        <BtnSuccess onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? (
            <>
              <X size={14} /> Отмена
            </>
          ) : (
            <>
              <UserPlus2 size={14} /> Новый пользователь
            </>
          )}
        </BtnSuccess>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="animate-fade-in overflow-hidden rounded-2xl border border-primary/30 bg-card shadow-sm">
          <div className="flex items-center gap-3 border-b border-border bg-primary/5 px-5 py-3.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <UserPlus2 size={14} className="text-primary" />
            </div>
            <p className="text-sm font-bold text-foreground">Новый пользователь</p>
          </div>
          <form action={handleCreate}>
            <div className="space-y-3 p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label required>Логин</Label>
                  <Input name="login" type="text" required placeholder="ivanov" />
                </div>
                <div>
                  <Label required>Пароль</Label>
                  <Input name="password" type="password" required placeholder="••••••••" />
                </div>
                <div>
                  <Label>Имя</Label>
                  <Input name="firstName" type="text" placeholder="Иван" />
                </div>
                <div>
                  <Label>Фамилия</Label>
                  <Input name="lastName" type="text" placeholder="Иванов" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Email</Label>
                  <Input name="email" type="email" placeholder="user@example.com" />
                </div>
              </div>
              {error && <ErrorBox message={error} />}
            </div>
            <div className="flex justify-end gap-2 border-t border-border bg-muted/40 px-5 py-3">
              <BtnSecondary type="button" onClick={() => setShowCreate(false)}>
                Отмена
              </BtnSecondary>
              <BtnSuccess type="submit">
                <Plus size={13} /> Создать
              </BtnSuccess>
            </div>
          </form>
        </div>
      )}

      {/* Users list */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/30 px-5 py-3">
          <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
            Пользователей: {users.length}
          </p>
          <p className="text-[10px] text-muted-foreground/70">
            Нажмите на роль, чтобы назначить или снять
          </p>
        </div>
        <div className="divide-y divide-border">
          {users.map((u) => {
            const fullName = u.firstName
              ? `${u.firstName} ${u.lastName ?? ''}`.trim()
              : u.login;
            return (
              <div
                key={u.usrId}
                className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/40 lg:flex-row lg:items-center"
              >
                {/* Identity */}
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary ring-1 ring-primary/20">
                    {initialsOf(u)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{fullName}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <AtSign size={11} />
                        {u.login}
                      </span>
                      {u.email && (
                        <span className="inline-flex items-center gap-1 truncate">
                          <Mail size={11} />
                          <span className="truncate">{u.email}</span>
                        </span>
                      )}
                    </div>
                    {u.policies.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {u.policies.map((p) => (
                          <span
                            key={p}
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${policyTone(
                              p,
                            )}`}
                          >
                            {POLICY_LABEL[p] ?? p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Role toggles */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {policies.map((pol) => {
                    const has = u.policies.includes(pol.policyName);
                    return (
                      <button
                        key={pol.policyId}
                        onClick={() => togglePolicy(u.usrId, pol.policyId, has)}
                        className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all duration-150 ${
                          has
                            ? policyTone(pol.policyName)
                            : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                        }`}
                        title={has ? 'Снять роль' : 'Назначить роль'}
                      >
                        <ShieldCheck size={10} className={has ? '' : 'opacity-60'} />
                        {POLICY_LABEL[pol.policyName] ?? pol.policyName}
                      </button>
                    );
                  })}
                </div>

                {/* Delete */}
                <div className="flex shrink-0 justify-end">
                  <button
                    onClick={() => handleDelete(u.usrId)}
                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-all hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                    title="Удалить"
                    aria-label="Удалить"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
          {users.length === 0 && (
            <p className="px-5 py-12 text-center text-sm text-muted-foreground">
              {search ? 'Ничего не найдено' : 'Пользователей пока нет'}
            </p>
          )}
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}