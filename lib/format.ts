
const dateTimeShort = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const dateTimeFull = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatShort(iso: string | null | undefined, fallback = 'Без даты'): string {
  if (!iso) return fallback;
  return dateTimeShort.format(new Date(iso));
}

export function formatFull(iso: string | null | undefined, fallback = '—'): string {
  if (!iso) return fallback;
  return dateTimeFull.format(new Date(iso));
}
