import type { StatusResponse } from './types';

export const STATUS_PLANNED = 1;
export const STATUS_OPEN = 2;
export const STATUS_SAVED = 3;
export const STATUS_CLOSED = 4;
export const STATUS_CANCELED = 5;

export const STATUSES: StatusResponse[] = [
  { statusId: STATUS_PLANNED, statusName: 'Запланирован' },
  { statusId: STATUS_OPEN, statusName: 'Открыт' },
  { statusId: STATUS_SAVED, statusName: 'Сохранен' },
  { statusId: STATUS_CLOSED, statusName: 'Закрыт' },
  { statusId: STATUS_CANCELED, statusName: 'Отменен' },
];

export const STATUS_HEX: Record<string, string> = {
  "запланирован": '#0d9488',
  "открыт": '#d97706',
  "сохранен": '#0369a1',
  "закрыт": '#059669',
  "отменен": '#6b7280',
};

export const FINAL_STATUSES: ReadonlySet<number> = new Set([STATUS_CLOSED, STATUS_CANCELED]);
