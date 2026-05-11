import { useState, useEffect } from 'react';
import { useApi } from '@/lib/hooks/use-api';
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
import { toast } from 'sonner';
import { SearchInput } from './SearchInput';
import { useConfirm } from '@/components/ConfirmDialog';

export function DrugsSection() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { confirm, dialog } = useConfirm();
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
      toast.success('Препарат добавлен', { description: fd.get('drugName') as string });
    } catch (err) {
      setError(extractApiError(err));
    }
  }

  async function handleDelete(id: number) {
    const ok = await confirm({
      title: 'Удалить препарат?',
      description: `Препарат #${id} будет удалён безвозвратно.`,
      confirmLabel: 'Удалить',
    });
    if (!ok) return;
    await drugsApi.delete(id);
    await reload();
    toast('Препарат удалён');
  }

  if (loading) return <CardSkeleton />;

  return (
    <div className="space-y-4">
      <div className="border-border bg-card flex flex-col gap-2 rounded-2xl border p-3 sm:flex-row sm:items-center">
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

      {showCreate && (
        <div className="animate-fade-in border-warning/30 bg-card overflow-hidden rounded-2xl border">
          <div className="border-border bg-warning/5 flex items-center gap-3 border-b px-5 py-3.5">
            <div className="border-border flex h-8 w-8 items-center justify-center rounded-lg border">
              <Pill size={14} className="text-warning" />
            </div>
            <p className="text-foreground text-sm font-semibold">Новый препарат</p>
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

      <div className="border-border bg-card overflow-hidden rounded-2xl border">
        <div className="border-border bg-muted/30 flex items-center justify-between gap-3 border-b px-5 py-3">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
            Препаратов: {drugs.length}
          </p>
        </div>
        <div className="divide-border divide-y">
          {drugs.map((d) => (
            <div
              key={d.drugId}
              className="hover:bg-muted/40 flex items-center gap-3 px-5 py-3.5 transition-colors"
            >
              <div className="border-border flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border">
                <Pill size={15} className="text-warning" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm font-semibold">{d.drugName}</p>
                <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                  {d.brand && (
                    <span className="border-border bg-muted inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium">
                      <Package size={10} />
                      {d.brand}
                    </span>
                  )}
                  {d.form && (
                    <span className="border-border bg-background inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium">
                      {d.form}
                    </span>
                  )}
                  {!d.brand && !d.form && <span className="text-muted-foreground/60">—</span>}
                </div>
              </div>
              <button
                onClick={() => handleDelete(d.drugId)}
                className="border-border bg-background text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border transition-all"
                title="Удалить"
                aria-label="Удалить"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {drugs.length === 0 && (
            <div className="px-5 py-12 text-center">
              <Pill size={28} className="text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                {debouncedSearch ? 'Ничего не найдено' : 'Препаратов пока нет'}
              </p>
            </div>
          )}
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      {dialog}
    </div>
  );
}
