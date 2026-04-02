import type { StatusResponse } from './types';

export const STATUS_PLANNED = 1;
export const STATUS_OPEN    = 2;
export const STATUS_SAVED   = 3;
export const STATUS_CLOSED  = 4;

export const STATUSES: StatusResponse[] = [
  { statusId: STATUS_PLANNED, statusName: 'Запланирован' },
  { statusId: STATUS_OPEN,    statusName: 'Открыт' },
  { statusId: STATUS_SAVED,   statusName: 'Сохранен' },
  { statusId: STATUS_CLOSED,  statusName: 'Закрыт' },
];

export const statusesApi = {
  getAll: () => Promise.resolve({ data: STATUSES }),
};
