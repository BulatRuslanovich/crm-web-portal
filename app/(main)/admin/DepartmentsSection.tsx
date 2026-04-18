import { useState } from 'react';
import { useApi } from '@/lib/use-api';
import { usersApi } from '@/lib/api/users';
import { departmentsApi } from '@/lib/api/departments';
import { extractApiError } from '@/lib/api/errors';
import {
  CardSkeleton,
  Input,
  Label,
  ErrorBox,
  BtnSuccess,
  BtnDanger,
  BtnSecondary,
  Pagination,
} from '@/components/ui';
import {
  Plus,
  X,
  Building,
  Info,
  Trash2,
  UserPlus,
  Users,
  Eye,
} from 'lucide-react';
import type { DepartmentResponse } from '@/lib/api/types';
import { isAxiosError } from 'axios';

function DepartmentMembersModal({
  department,
  onClose,
}: {
  department: DepartmentResponse;
  onClose: () => void;
}) {
  const [error, setError] = useState('');

  const { data: allUsers = [], loading } = useApi(
    ['admin-all-users-for-dept', department.departmentId],
    () => usersApi.getAll(1, 500).then((r) => r.data.items),
  );

  const [memberIds, setMemberIds] = useState<Set<number>>(new Set());

  async function addMember(usrId: number) {
    setError('');
    try {
      await departmentsApi.addUser(department.departmentId, usrId);
      setMemberIds((prev) => new Set(prev).add(usrId));
    } catch (err) {
      setError(extractApiError(err));
    }
  }

  async function removeMember(usrId: number) {
    setError('');
    try {
      await departmentsApi.removeUser(department.departmentId, usrId);
      setMemberIds((prev) => {
        const next = new Set(prev);
        next.delete(usrId);
        return next;
      });
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) {
        setMemberIds((prev) => {
          const next = new Set(prev);
          next.delete(usrId);
          return next;
        });
        setError('Связь не найдена, обновил состояние');
        return;
      }
      setError(extractApiError(err));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/30 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/10 ring-1 ring-success/20">
              <Building size={16} className="text-success" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Состав департамента
              </p>
              <h3 className="truncate text-base font-bold text-foreground">
                {department.departmentName}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Закрыть"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto p-4">
          <div className="flex items-start gap-2 rounded-xl border border-border bg-accent px-3 py-2.5 text-xs text-foreground">
            <Info size={13} className="mt-0.5 shrink-0 text-muted-foreground" />
            <span>
              Менеджер видит визиты всех пользователей из своего департамента (плюс свои).
              Изменяя состав, вы меняете scope видимости активностей.
            </span>
          </div>

          {error && <ErrorBox message={error} />}

          {loading ? (
            <CardSkeleton />
          ) : (
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
              {allUsers.map((u) => {
                const isMember = memberIds.has(u.usrId);
                const fullName = u.firstName
                  ? `${u.firstName} ${u.lastName ?? ''}`.trim()
                  : u.login;
                return (
                  <div
                    key={u.usrId}
                    className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/30"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {fullName}
                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                          ({u.login})
                        </span>
                      </p>
                    </div>
                    {isMember ? (
                      <BtnDanger onClick={() => removeMember(u.usrId)}>
                        <Trash2 size={13} /> Убрать
                      </BtnDanger>
                    ) : (
                      <BtnSuccess onClick={() => addMember(u.usrId)}>
                        <UserPlus size={13} /> Добавить
                      </BtnSuccess>
                    )}
                  </div>
                );
              })}
              {allUsers.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Пользователей нет
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-border bg-muted/40 px-5 py-3">
          <BtnSecondary onClick={onClose}>Закрыть</BtnSecondary>
        </div>
      </div>
    </div>
  );
}

export function DepartmentsSection() {
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const [showCreate, setShowCreate] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState<DepartmentResponse | null>(null);

  const { data, loading, reload } = useApi(
    ['admin-departments', page],
    () => departmentsApi.getAll(page, pageSize).then((r) => r.data),
    { keepPreviousData: true },
  );

  const departments = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError('');
    const name = newName.trim();
    if (!name) {
      setCreateError('Введите название');
      return;
    }
    if (name.length > 255) {
      setCreateError('Название не должно превышать 255 символов');
      return;
    }
    try {
      await departmentsApi.create({ departmentName: name });
      setShowCreate(false);
      setNewName('');
      await reload();
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setCreateError('Департамент с таким названием уже существует');
        return;
      }
      setCreateError(extractApiError(err));
    }
  }

  async function handleDelete(d: DepartmentResponse) {
    if (!confirm(`Удалить департамент «${d.departmentName}»?`)) return;
    try {
      await departmentsApi.delete(d.departmentId);
      await reload();
    } catch (err) {
      alert(extractApiError(err));
    }
  }

  if (loading) return <CardSkeleton />;

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning/15 ring-1 ring-warning/25">
          <Eye size={14} className="text-warning" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-warning">Как работает видимость</p>
          <p className="mt-0.5 text-xs text-foreground/80">
            Менеджеры видят визиты пользователей только из своих департаментов. Управление составом
            — это управление тем, кто чьи визиты видит.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm">
        <p className="px-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
          Департаментов: {departments.length}
        </p>
        <BtnSuccess
          onClick={() => {
            setShowCreate(!showCreate);
            setCreateError('');
          }}
        >
          {showCreate ? (
            <>
              <X size={14} /> Отмена
            </>
          ) : (
            <>
              <Plus size={14} /> Новый департамент
            </>
          )}
        </BtnSuccess>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="animate-fade-in overflow-hidden rounded-2xl border border-success/30 bg-card shadow-sm">
          <div className="flex items-center gap-3 border-b border-border bg-success/5 px-5 py-3.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 ring-1 ring-success/20">
              <Building size={14} className="text-success" />
            </div>
            <p className="text-sm font-bold text-foreground">Новый департамент</p>
          </div>
          <form onSubmit={handleCreate}>
            <div className="space-y-3 p-5">
              <div>
                <Label required>Название департамента</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  maxLength={255}
                  placeholder="Например, Центральный"
                  required
                  autoFocus
                />
              </div>
              {createError && <ErrorBox message={createError} />}
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

      {/* Departments grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {departments.map((d) => (
          <div
            key={d.departmentId}
            className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-success/30 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/10 ring-1 ring-success/20">
                <Building size={16} className="text-success" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{d.departmentName}</p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Users size={11} />
                  {d.userCount} пользовател{d.userCount === 1 ? 'ь' : d.userCount >= 2 && d.userCount <= 4 ? 'я' : 'ей'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BtnSecondary onClick={() => setEditing(d)} className="flex-1">
                <UserPlus size={13} /> Состав
              </BtnSecondary>
              <button
                onClick={() => handleDelete(d)}
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-all hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                title="Удалить"
                aria-label="Удалить"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {departments.length === 0 && (
        <div className="rounded-2xl border border-border bg-card py-16 text-center shadow-sm">
          <Building size={28} className="mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Департаментов пока нет</p>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      {editing && (
        <DepartmentMembersModal
          department={editing}
          onClose={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
    </div>
  );
}