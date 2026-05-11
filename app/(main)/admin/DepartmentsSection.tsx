import React, { useState } from 'react';
import { useApi } from '@/lib/hooks/use-api';
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
import { Plus, X, Building, Info, Trash2, UserPlus, Users, Eye } from 'lucide-react';
import { toast } from 'sonner';
import type { DepartmentResponse } from '@/lib/api/types';
import { isAxiosError } from 'axios';
import { useConfirm } from '@/components/ConfirmDialog';

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
      <div className="border-border bg-card w-full max-w-2xl overflow-hidden rounded-2xl border shadow-xl">
        <div className="border-border bg-muted/30 flex items-center justify-between gap-3 border-b px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="border-border flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border">
              <Building size={16} className="text-success" />
            </div>
            <div className="min-w-0">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                Состав департамента
              </p>
              <h3 className="text-foreground truncate text-base font-semibold">
                {department.departmentName}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground/70 hover:bg-muted hover:text-foreground flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors"
            aria-label="Закрыть"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto p-4">
          <div className="border-border bg-accent text-foreground flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs">
            <Info size={13} className="text-muted-foreground mt-0.5 shrink-0" />
            <span>
              Менеджер видит визиты всех пользователей из своего департамента (плюс свои). Изменяя
              состав, вы меняете scope видимости активностей.
            </span>
          </div>

          {error && <ErrorBox message={error} />}

          {loading ? (
            <CardSkeleton />
          ) : (
            <div className="divide-border border-border divide-y overflow-hidden rounded-xl border">
              {allUsers.map((u) => {
                const isMember = memberIds.has(u.usrId);
                const fullName = u.firstName
                  ? `${u.firstName} ${u.lastName ?? ''}`.trim()
                  : u.login;
                return (
                  <div
                    key={u.usrId}
                    className="hover:bg-muted/30 flex items-center justify-between gap-4 px-4 py-3 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground truncate text-sm font-medium">
                        {fullName}
                        <span className="text-muted-foreground ml-1.5 text-xs font-normal">
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
                <p className="text-muted-foreground px-4 py-6 text-center text-sm">
                  Пользователей нет
                </p>
              )}
            </div>
          )}
        </div>

        <div className="border-border bg-muted/40 flex justify-end border-t px-5 py-3">
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
  const { confirm, dialog } = useConfirm();

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
      toast.success('Департамент создан', { description: name });
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setCreateError('Департамент с таким названием уже существует');
        return;
      }
      setCreateError(extractApiError(err));
    }
  }

  async function handleDelete(d: DepartmentResponse) {
    const ok = confirm({
      title: 'Удалить департамент?',
      description: `Департамент «${d.departmentName}» будет удалён безвозвратно. Пользователи из этого департамента не будут удалены, но потеряют доступ к своим визитам, если не будут в других департаментах.`,
      confirmLabel: 'Удалить',
    });

    if (!ok) return;

    try {
      await departmentsApi.delete(d.departmentId);
      await reload();
      toast('Департамент удалён', { description: d.departmentName });
    } catch (err) {
      alert(extractApiError(err));
    }
  }

  if (loading) return <CardSkeleton />;

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="border-warning/30 bg-warning/10 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm">
        <div className="border-border flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border">
          <Eye size={14} className="text-warning" />
        </div>
        <div className="min-w-0">
          <p className="text-warning text-xs font-semibold">Как работает видимость</p>
          <p className="text-foreground/80 mt-0.5 text-xs">
            Менеджеры видят визиты пользователей только из своих департаментов. Управление составом
            — это управление тем, кто чьи визиты видит.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-border bg-card flex items-center justify-between gap-2 rounded-2xl border p-3">
        <p className="text-muted-foreground px-2 text-xs font-semibold tracking-wider uppercase">
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
        <div className="animate-fade-in border-success/30 bg-card overflow-hidden rounded-2xl border">
          <div className="border-border bg-success/5 flex items-center gap-3 border-b px-5 py-3.5">
            <div className="border-border flex h-8 w-8 items-center justify-center rounded-lg border">
              <Building size={14} className="text-success" />
            </div>
            <p className="text-foreground text-sm font-semibold">Новый департамент</p>
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
            <div className="border-border bg-muted/40 flex justify-end gap-2 border-t px-5 py-3">
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
            className="group border-border bg-card hover:border-success/30 flex flex-col gap-3 rounded-2xl border p-4 transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="border-border flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border">
                <Building size={16} className="text-success" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm font-semibold">{d.departmentName}</p>
                <p className="text-muted-foreground mt-0.5 inline-flex items-center gap-1 text-xs">
                  <Users size={11} />
                  {d.userCount} пользовател
                  {d.userCount === 1 ? 'ь' : d.userCount >= 2 && d.userCount <= 4 ? 'я' : 'ей'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BtnSecondary onClick={() => setEditing(d)} className="flex-1">
                <UserPlus size={13} /> Состав
              </BtnSecondary>
              <button
                onClick={() => handleDelete(d)}
                className="border-border bg-background text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border transition-all"
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
        <div className="border-border bg-card rounded-2xl border py-16 text-center">
          <Building size={28} className="text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">Департаментов пока нет</p>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      {editing && (
        <DepartmentMembersModal
          department={editing}
          onClose={() => {
            setEditing(null);
            reload().then();
          }}
        />
      )}

      {dialog}
    </div>
  );
}
