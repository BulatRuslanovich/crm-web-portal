import { activsApi } from '@/lib/api/activs';
import { MONTHS_ABBR } from '@/lib/ru-dates';
import { startOfDay } from '@/lib/date';
import { ActivResponse } from '@/lib/api/types';

export async function syncDrugs(numId: number, diff: { toAdd: number[]; toRemove: number[] }) {
  await Promise.all([
    ...diff.toAdd.map((did) => activsApi.addDrug(numId, did)),
    ...diff.toRemove.map((did) => activsApi.removeDrug(numId, did)),
  ]);
}

export type TargetKind = 'phys' | 'org' | 'none';

export function targetKind(a: ActivResponse): TargetKind {
  if (a.physId != null) return 'phys';
  if (a.orgId != null) return 'org';
  return 'none';
}

export function targetLabel(a: ActivResponse): string {
  return a.physName ?? a.orgName ?? '';
}

export function targetKindLabel(kind: TargetKind): string {
  if (kind === 'phys') return 'Врач';
  if (kind === 'org') return 'Организация';
  return '';
}

const MS_PER_DAY = 86_400_000;
const MS_PER_MIN = 60_000;

export interface DateTimeParts {
  date: string;
  time: string;
}

export function formatDateTime(iso: string | null | undefined): DateTimeParts | null {
  if (!iso) return null;
  const d = new Date(iso);
  const date = `${d.getDate()} ${MONTHS_ABBR[d.getMonth()]} ${d.getFullYear()}`;
  const time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  return { date, time };
}

export function formatDuration(start: string | null, end: string | null): string | null {
  if (!start || !end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms <= 0) return null;

  const mins = Math.round(ms / MS_PER_MIN);
  if (mins < 60) return `${mins} мин`;

  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  return rest === 0 ? `${hours} ч` : `${hours} ч ${rest} мин`;
}

function dayGroupLabel(iso: string | null): string {
  if (!iso) return 'Без даты';
  const target = startOfDay(new Date(iso)).getTime();
  const today = startOfDay(new Date()).getTime();
  const diffDays = Math.round((target - today) / MS_PER_DAY);

  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Завтра';
  if (diffDays === -1) return 'Вчера';
  if (diffDays > 1 && diffDays <= 7) return 'На этой неделе';
  if (diffDays < -1 && diffDays >= -7) return 'На прошлой неделе';
  return new Date(iso).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
}

const GROUP_ORDER: Record<string, number> = {
  "Сегодня": 0,
  "Завтра": 1,
  'На этой неделе': 2,
  "Вчера": 3,
  'На прошлой неделе': 4,
  'Без даты': 99,
};

function dayGroupOrder(label: string): number {
  return GROUP_ORDER[label] ?? 50;
}

const STATUS_STRIPE: Record<string, string> = {
  "запланирован": 'bg-primary',
  "открыт": 'bg-warning',
  "сохранен": 'bg-muted-foreground',
  "закрыт": 'bg-success',
  "отменен": 'bg-destructive',
};

export function statusStripeClass(statusName: string): string {
  return STATUS_STRIPE[statusName.toLowerCase()] ?? 'bg-border';
}

const STATUS_ACCENT: Record<string, string> = {
  "запланирован": 'from-primary/15 via-primary/5 to-transparent',
  "открыт": 'from-warning/20 via-warning/5 to-transparent',
  "сохранен": 'from-muted-foreground/15 via-muted-foreground/5 to-transparent',
  "закрыт": 'from-success/15 via-success/5 to-transparent',
  "отменен": 'from-destructive/15 via-destructive/5 to-transparent',
};

export function statusAccentGradient(statusName: string): string {
  return STATUS_ACCENT[statusName.toLowerCase()] ?? 'from-success/30 via-success/10 to-transparent';
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

export function groupActivsByDay(activs: ActivResponse[]): Array<[string, ActivResponse[]]> {
  const map = new Map<string, ActivResponse[]>();
  for (const activ of activs) {
    const key = dayGroupLabel(activ.start);
    const bucket = map.get(key) ?? [];
    bucket.push(activ);
    map.set(key, bucket);
  }
  return [...map.entries()].sort((a, b) => dayGroupOrder(a[0]) - dayGroupOrder(b[0]));
}
