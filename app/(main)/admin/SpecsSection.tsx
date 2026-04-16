import { useState, useMemo } from 'react';
import { useApi } from '@/lib/use-api';
import { specsApi } from '@/lib/api/specs';
import {
  Card,
  CardSkeleton,
  Input,
  BtnSuccess,
  BtnDanger,
  Pagination,
} from '@/components/ui';
import { Plus } from 'lucide-react';
import { SearchInput } from './SearchInput';

export function SpecsSection() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

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
      <div className="flex items-center gap-2">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Поиск по названию…"
        />
        <form action={handleCreate} className="flex gap-2">
          <Input name="specName" type="text" placeholder="Новая специальность" required />
          <BtnSuccess type="submit">
            <Plus size={14} /> Добавить
          </BtnSuccess>
        </form>
      </div>

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
              {search ? 'Ничего не найдено' : 'Специальностей пока нет'}
            </p>
          )}
        </div>
      </Card>

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}
