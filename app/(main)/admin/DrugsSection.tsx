import { useState, useEffect } from 'react';
import { useApi } from '@/lib/use-api';
import { drugsApi } from '@/lib/api/drugs';
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
import { Plus, X, Pill, Trash2, Package } from 'lucide-react';
import { SearchInput } from './SearchInput';

export function DrugsSection() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const pageSize = 20;

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, loading, reload } = useApi(
    ['admin-drugs', page, debouncedSearch],
    () => drugsApi.getAll(page, pageSize, debouncedSearch || undefined).then(({ data }) => data),
    { keepPreviousData: true },
  );

  const drugs = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;

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
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Поиск по названию…" />
        <BtnSuccess onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? (
            <>
              <X size={14} /> Отмена
            </>
          ) : (
            <>
              <Plus size={14} /> Новый препарат
            </>
          )}
        </BtnSuccess>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="animate-fade-in overflow-hidden rounded-2xl border border-warning/30 bg-card shadow-sm">
          <div className="flex items-center gap-3 border-b border-border bg-warning/5 px-5 py-3.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/15 ring-1 ring-warning/25">
              <Pill size={14} className="text-warning" />
            </div>
            <p className="text-sm font-bold text-foreground">Новый препарат</p>
          </div>
          <form action={handleCreate}>
            <div className="space-y-3 p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                  <Input name="form" type="text" required placeholder="Таблетки, сироп…" />
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

      {/* Drugs list */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/30 px-5 py-3">
          <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
            Препаратов: {drugs.length}
          </p>
        </div>
        <div className="divide-y divide-border">
          {drugs.map((d) => (
            <div
              key={d.drugId}
              className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/10 ring-1 ring-warning/20">
                <Pill size={15} className="text-warning" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{d.drugName}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {d.brand && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium">
                      <Package size={10} />
                      {d.brand}
                    </span>
                  )}
                  {d.form && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium">
                      {d.form}
                    </span>
                  )}
                  {!d.brand && !d.form && <span className="text-muted-foreground/60">—</span>}
                </div>
              </div>
              <button
                onClick={() => handleDelete(d.drugId)}
                className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-all hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                title="Удалить"
                aria-label="Удалить"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {drugs.length === 0 && (
            <div className="px-5 py-12 text-center">
              <Pill size={28} className="mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {debouncedSearch ? 'Ничего не найдено' : 'Препаратов пока нет'}
              </p>
            </div>
          )}
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}