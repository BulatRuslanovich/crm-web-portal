'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { orgsApi } from '@/lib/api/orgs';
import type { OrgTypeResponse } from '@/lib/api/types';
import { AxiosError } from 'axios';
import { BackButton, Card, CardFooter, Label, Input, Select, ErrorBox, BtnSecondary, BtnSuccess } from '@/components/ui';

export default function CreateOrgPage() {
  const router = useRouter();
  const [types, setTypes] = useState<OrgTypeResponse[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { orgsApi.getTypes().then(({ data }) => setTypes(data)); }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <BackButton onClick={() => router.back()} />
        <h2 className="text-xl font-semibold text-(--fg)">Новая организация</h2>
      </div>

      <form
        action={async (fd: FormData) => {
          setError('');
          setLoading(true);
          try {
            const { data } = await orgsApi.create({
              orgTypeId: Number(fd.get('orgTypeId')),
              orgName: fd.get('orgName') as string,
              inn: (fd.get('inn') as string) || null,
              address: (fd.get('address') as string) || null,
              latitude: fd.get('latitude') ? Number(fd.get('latitude')) : null,
              longitude: fd.get('longitude') ? Number(fd.get('longitude')) : null,
            });
            router.push(`/orgs/${data.orgId}`);
          } catch (err) {
            const e = err as AxiosError<{ message?: string }>;
            setError(e.response?.data?.message ?? 'Ошибка создания');
          } finally {
            setLoading(false);
          }
        }}
      >
        <Card>
          <div className="p-4 space-y-4">
            <div>
              <Label required>Тип организации</Label>
              <Select name="orgTypeId" required>
                <option value="">Выберите тип</option>
                {types.map((t) => <option key={t.orgTypeId} value={t.orgTypeId}>{t.orgTypeName}</option>)}
              </Select>
            </div>
            <div>
              <Label required>Название</Label>
              <Input name="orgName" type="text" required placeholder="Городская больница №1" />
            </div>
            <div>
              <Label>ИНН</Label>
              <Input name="inn" type="text" placeholder="0000000000" />
            </div>
            <div>
              <Label>Адрес</Label>
              <Input name="address" type="text" placeholder="г. Москва, ул. Примерная, 1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Широта</Label>
                <Input name="latitude" type="number" step="any" placeholder="55.7558" />
              </div>
              <div>
                <Label>Долгота</Label>
                <Input name="longitude" type="number" step="any" placeholder="37.6173" />
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
