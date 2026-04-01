import type { StatusResponse } from './types';

export const STATUSES: StatusResponse[] = [
  { statusId: 1, statusName: 'Запланирован' },
  { statusId: 2, statusName: 'Открыт' },
  { statusId: 3, statusName: 'Сохранен' },
  { statusId: 4, statusName: 'Закрыт' },
];

export const statusesApi = {
  getAll: () => Promise.resolve({ data: STATUSES }),
};
