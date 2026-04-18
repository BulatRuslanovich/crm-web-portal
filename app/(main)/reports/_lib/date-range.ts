export interface DateRange {
  from: string;
  to: string;
}

export interface Preset {
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

export function fmtDate(d: Date): string {
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
