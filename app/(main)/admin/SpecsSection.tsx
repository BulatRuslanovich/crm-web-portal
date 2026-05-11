import { useState, useMemo, useRef } from 'react';
import { useApi } from '@/lib/hooks/use-api';
import { specsApi } from '@/lib/api/specs';
import { CardSkeleton, Input, BtnSuccess, Pagination } from '@/components/ui';
import { Plus, GraduationCap, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { SearchInput } from './SearchInput';
import { useConfirm } from '@/components/ConfirmDialog';

export function SpecsSection() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const formRef = useRef<HTMLFormElement>(null);
  const { confirm, dialog } = useConfirm();

  const {
    data: allSpecs = [],
    loading,
    reload,
  } = useApi('admin-specs', () => specsApi.getAll().then(({ data }) => data));

  const filtered = useMemo(() => {
    if (!search.trim()) return allSpecs;
    const q = search.toLowerCase();
    return allSpecs.filter((s) => s.specName.toLowerCase().includes(q));
  }, [allSpecs, search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const safePage = page > totalPages && totalPages > 0 ? totalPages : page;
  const specs = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  async function handleCreate(fd: FormData) {
    const name = (fd.get('specName') as string).trim();
    if (!name) return;
    await specsApi.create(name);
    formRef.current?.reset();
    await reload();
    toast.success('Специальность добавлена', { description: name });
  }

  async function handleDelete(id: number) {
    const ok = await confirm({
      title: 'Удалить специальность?',
      description: `Специальность #${id} будет удалена безвозвратно.`,
      confirmLabel: 'Удалить',
    });
    if (!ok) return;
    await specsApi.delete(id);
    await reload();
    toast('Специальность удалена');
  }

  if (loading) return <CardSkeleton />;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="border-border bg-card flex flex-col gap-2 rounded-2xl border p-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Поиск по названию…"
        />
        <form ref={formRef} action={handleCreate} className="flex flex-1 gap-2 sm:flex-none">
          <Input
            name="specName"
            type="text"
            placeholder="Новая специальность"
            required
            className="sm:w-64"
          />
          <BtnSuccess type="submit">
            <Plus size={14} /> Добавить
          </BtnSuccess>
        </form>
      </div>

      {/* Specs grid */}
      <div className="border-border bg-card overflow-hidden rounded-2xl border">
        <div className="border-border bg-muted/30 flex items-center justify-between gap-3 border-b px-5 py-3">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
            Специальностей: {filtered.length}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3">
          {specs.map((s) => (
            <div
              key={s.specId}
              className="group border-border bg-background hover:border-primary/30 hover:bg-muted/60 flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors"
            >
              <div className="bg-muted ring-border flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
                <GraduationCap size={14} className="text-muted-foreground" />
              </div>
              <p className="text-foreground min-w-0 flex-1 truncate text-sm font-medium">
                {s.specName}
              </p>
              <button
                onClick={() => handleDelete(s.specId)}
                className="text-muted-foreground/60 hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-transparent opacity-0 transition-all group-hover:opacity-100"
                title="Удалить"
                aria-label="Удалить"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        {specs.length === 0 && (
          <div className="px-5 py-12 text-center">
            <GraduationCap size={28} className="text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">
              {search ? 'Ничего не найдено' : 'Специальностей пока нет'}
            </p>
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      {dialog}
    </div>
  );
}
