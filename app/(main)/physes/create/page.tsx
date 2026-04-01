'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { physesApi } from '@/lib/api/physes';
import { specsApi } from '@/lib/api/specs';
import type { SpecResponse } from '@/lib/api/types';
import { AxiosError } from 'axios';
import { BackButton, Card, CardFooter, Label, Input, Select, ErrorBox, BtnSecondary, BtnSuccess } from '@/components/ui';

export default function CreatePhysPage() {
  const router = useRouter();
  const [specs, setSpecs] = useState<SpecResponse[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { specsApi.getAll().then(({ data }) => setSpecs(data)); }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <BackButton onClick={() => router.back()} />
        <h2 className="text-xl font-semibold text-(--fg)">Новый врач</h2>
      </div>

      <form
        action={async (fd: FormData) => {
          setError('');
          setLoading(true);
          try {
            const { data } = await physesApi.create({
              specId: fd.get('specId') ? Number(fd.get('specId')) : null,
              lastName: fd.get('lastName') as string,
              firstName: (fd.get('firstName') as string) || null,
              middleName: (fd.get('middleName') as string) || null,
              phone: (fd.get('phone') as string) || null,
              email: (fd.get('email') as string) || null,
              position: (fd.get('position') as string) || null,
            });
            router.push(`/physes/${data.physId}`);
          } catch (err) {
            const e = err as AxiosError<{ message?: string }>;
            setError(e.response?.data?.message ?? 'Ошибка создания');
          } finally { setLoading(false); }
        }}
      >
        <Card>
          <div className="p-4 space-y-4">
            <div>
              <Label required>Фамилия</Label>
              <Input name="lastName" type="text" required placeholder="Иванов" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Имя</Label>
                <Input name="firstName" type="text" placeholder="Иван" />
              </div>
              <div>
                <Label>Отчество</Label>
                <Input name="middleName" type="text" placeholder="Иванович" />
              </div>
            </div>
            <div>
              <Label>Специальность</Label>
              <Select name="specId">
                <option value="">Не указана</option>
                {specs.map((s) => <option key={s.specId} value={s.specId}>{s.specName}</option>)}
              </Select>
            </div>
            <div>
              <Label>Должность</Label>
              <Input name="position" type="text" placeholder="Главный врач" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Телефон</Label>
                <Input name="phone" type="tel" placeholder="+7 999 000 00 00" />
              </div>
              <div>
                <Label>Email</Label>
                <Input name="email" type="email" placeholder="doctor@example.com" />
              </div>
            </div>
            {error && <ErrorBox message={error} />}
          </div>
          <CardFooter>
            <BtnSecondary type="button" onClick={() => router.back()}>Отмена</BtnSecondary>
            <BtnSuccess type="submit" disabled={loading}>{loading ? 'Создание...' : 'Создать'}</BtnSuccess>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
