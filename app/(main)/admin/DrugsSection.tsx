import { useState, useEffect } from 'react';
import { useApi } from '@/lib/use-api';
import { drugsApi } from '@/lib/api/drugs';
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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Поиск по названию…"
        />
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
            <p className="px-5 py-8 text-center text-sm text-(--fg-muted)">
              {debouncedSearch ? 'Ничего не найдено' : 'Препаратов пока нет'}
            </p>
          )}
        </div>
      </Card>

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}
