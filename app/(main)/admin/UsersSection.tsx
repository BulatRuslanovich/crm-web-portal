import { useState, useMemo } from 'react';
import { useApi } from '@/lib/use-api';
import { usersApi } from '@/lib/api/users';
import { extractApiError } from '@/lib/api/errors';
import {
  Card,
  CardSkeleton,
  Input,
  Label,
  ErrorBox,
  BtnSuccess,
  BtnDanger,
  Pagination,
} from '@/components/ui';
import { Plus, X } from 'lucide-react';
import { SearchInput } from './SearchInput';

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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Поиск по логину, имени, email…"
        />
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
          {users.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-(--fg-muted)">
              {search ? 'Ничего не найдено' : 'Пользователей пока нет'}
            </p>
          )}
        </div>
      </Card>

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}
