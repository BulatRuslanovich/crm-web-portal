export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function monBasedDow(d: Date): number {
  return (d.getDay() + 6) % 7;
}

export function addDays(d: Date, n: number): Date {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt;
}

export function startOfWeek(d: Date): Date {
  const dt = startOfDay(d);
  dt.setDate(dt.getDate() - monBasedDow(dt));
  return dt;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function fmtHM(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function fmtMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function fmtTimeIso(iso: string | null): string {
  if (!iso) return '--:--';
  return fmtHM(new Date(iso));
}

interface DateRange {
  from: string;
  to: string;
}

interface Preset {
  key: string;
  label: string;
  days: number;
}

export const PRESETS: Preset[] = [
  { key: '7', label: '7 дней', days: 7 },
  { key: '30', label: '30 дней', days: 30 },
  { key: '90', label: 'Квартал', days: 90 },
  { key: '365', label: 'Год', days: 365 },
];

const DEFAULT_RANGE_DAYS = 30;

function fmtDate(d: Date): string {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function toIso(date: string, endOfDay = false): string | undefined {
  if (!date) return undefined;
  return new Date(date + (endOfDay ? 'T23:59:59' : 'T00:00:00')).toISOString();
}

export function defaultRange(): DateRange {
  const today = new Date();
  const past = new Date();
  past.setDate(past.getDate() - (DEFAULT_RANGE_DAYS - 1));
  return { from: fmtDate(past), to: fmtDate(today) };
}

export function rangeForPreset(days: number): DateRange {
  const today = new Date();
  const past = new Date();
  past.setDate(past.getDate() - (days - 1));
  return { from: fmtDate(past), to: fmtDate(today) };
}

export function matchPreset(from: string, to: string): string {
  for (const p of PRESETS) {
    const r = rangeForPreset(p.days);
    if (r.from === from && r.to === to) return p.key;
  }
  return '';
}
