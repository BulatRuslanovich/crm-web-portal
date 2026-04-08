'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/lib/use-api';
import { physesApi } from '@/lib/api/physes';
import { specsApi } from '@/lib/api/specs';
import { extractApiError } from '@/lib/api/errors';
import {
  BackButton,
  Card,
  CardFooter,
  Label,
  Input,
  Select,
  ErrorBox,
  BtnSecondary,
  BtnSuccess,
} from '@/components/ui';

export default function CreatePhysPage() {
  const router = useRouter();
  const { data: specs = [] } = useApi(() => specsApi.getAll().then(({ data }) => data));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center gap-3">
        <BackButton onClick={() => router.back()} />
        <h2 className="text-xl font-semibold text-(--fg)">Новый врач</h2>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setError('');
          setLoading(true);
          try {
            const { data } = await physesApi.create({
              specId: Number(fd.get('specId')),
              lastName: fd.get('lastName') as string,
              firstName: (fd.get('firstName') as string) || '',
              middleName: (fd.get('middleName') as string) || '',
              phone: (fd.get('phone') as string) || '',
              email: (fd.get('email') as string) || '',
              position: (fd.get('position') as string) || '',
            });
            router.push(`/physes/${data.physId}`);
          } catch (err) {
            setError(extractApiError(err, 'Ошибка создания'));
          } finally {
            setLoading(false);
          }
        }}
      >
        <Card>
          <div className="space-y-4 p-4">
            <div>
              <Label required>Фамилия</Label>
              <Input name="lastName" type="text" required placeholder="Иванов" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <Label required>Специальность</Label>
              <Select name="specId" required>
                <option value="">Выберите специальность</option>
                {specs.map((s) => (
                  <option key={s.specId} value={s.specId}>
                    {s.specName}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Должность</Label>
              <Input name="position" type="text" placeholder="Главный врач" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <BtnSecondary type="button" onClick={() => router.back()}>
              Отмена
            </BtnSecondary>
            <BtnSuccess type="submit" disabled={loading}>
              {loading ? 'Создание...' : 'Создать'}
            </BtnSuccess>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
