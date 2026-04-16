import { useState } from 'react';
import { useApi } from '@/lib/use-api';
import { usersApi } from '@/lib/api/users';
import { departmentsApi } from '@/lib/api/departments';
import { extractApiError } from '@/lib/api/errors';
import {
  Card,
  CardSkeleton,
  Input,
  Label,
  ErrorBox,
  BtnSuccess,
  BtnDanger,
  BtnSecondary,
  Pagination,
} from '@/components/ui';
import { Plus, X, Building, Info, Trash2, UserPlus } from 'lucide-react';
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
      <Card className="w-full max-w-2xl">
        <div className="flex items-center justify-between border-b border-(--border) px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-(--fg)">{department.departmentName}</h3>
            <p className="mt-0.5 text-xs text-(--fg-muted)">
              Состав департамента — управляет тем, визиты чьих сотрудников видят менеджеры
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer text-(--fg-subtle) hover:text-(--fg)"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[60vh] space-y-2 overflow-y-auto p-4">
          <div className="flex items-start gap-2 rounded-xl border border-(--primary-border) bg-(--primary-subtle) px-3 py-2 text-xs text-(--primary-text)">
            <Info size={13} className="mt-0.5 shrink-0" />
            <span>
              Менеджер видит визиты всех пользователей из своего департамента (плюс свои).
              Изменяя состав, вы меняете scope видимости активностей.
            </span>
          </div>

          {error && <ErrorBox message={error} />}

          {loading ? (
            <CardSkeleton />
          ) : (
            <div className="divide-y divide-(--border) rounded-xl border border-(--border)">
              {allUsers.map((u) => {
                const isMember = memberIds.has(u.usrId);
                return (
                  <div
                    key={u.usrId}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-(--fg)">
                        {u.firstName ? `${u.firstName} ${u.lastName ?? ''}`.trim() : u.login}
                        <span className="ml-1.5 text-xs text-(--fg-muted)">({u.login})</span>
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
                <p className="px-4 py-6 text-center text-sm text-(--fg-muted)">
                  Пользователей нет
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-(--border) bg-(--surface-raised)/50 px-5 py-4">
          <BtnSecondary onClick={onClose}>Закрыть</BtnSecondary>
        </div>
      </Card>
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
    <div className="space-y-3">
      <div className="flex items-start gap-2 rounded-xl border border-(--warn-border) bg-(--warn-subtle) px-3.5 py-2.5 text-xs text-(--warn-text)">
        <Info size={14} className="mt-0.5 shrink-0" />
        <span>
          Менеджеры видят визиты пользователей только из своих департаментов.
          Управление составом = управление тем, кто чьи визиты видит.
        </span>
      </div>

      <div className="flex justify-end">
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

      {showCreate && (
        <Card className="animate-fade-in">
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
                />
              </div>
              {createError && <ErrorBox message={createError} />}
            </div>
            <div className="flex justify-end rounded-b-2xl border-t border-(--border) bg-(--surface-raised)/50 px-5 py-4">
              <BtnSuccess type="submit">Создать</BtnSuccess>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="divide-y divide-(--border)">
          {departments.map((d) => (
            <div
              key={d.departmentId}
              className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate text-sm font-semibold text-(--fg)">
                  <Building size={14} className="shrink-0 text-(--fg-muted)" />
                  {d.departmentName}
                </p>
                <p className="mt-0.5 text-xs text-(--fg-muted)">
                  Пользователей: {d.userCount}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <BtnSecondary onClick={() => setEditing(d)}>
                  <UserPlus size={13} /> Состав
                </BtnSecondary>
                <BtnDanger onClick={() => handleDelete(d)}>
                  <Trash2 size={13} /> Удалить
                </BtnDanger>
              </div>
            </div>
          ))}
          {departments.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-(--fg-muted)">
              Департаментов пока нет
            </p>
          )}
        </div>
      </Card>

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
