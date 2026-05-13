import {
  STATUS_CANCELED,
  STATUS_CLOSED,
  STATUS_OPEN,
  STATUS_PLANNED,
  STATUS_SAVED,
} from '@/lib/api/statuses';

export type StatusTone = 'planned' | 'open' | 'saved' | 'closed' | 'canceled' | 'neutral';

const TONE_BY_ID: Record<number, StatusTone> = {
  [STATUS_PLANNED]: 'planned',
  [STATUS_OPEN]: 'open',
  [STATUS_SAVED]: 'saved',
  [STATUS_CLOSED]: 'closed',
  [STATUS_CANCELED]: 'canceled',
};

const TONE_BY_NAME: Record<string, StatusTone> = {
  запланирован: 'planned',
  открыт: 'open',
  сохранен: 'saved',
  закрыт: 'closed',
  отменен: 'canceled',
};

const DOT_CLASS: Record<StatusTone, string> = {
  planned: 'bg-primary',
  open: 'bg-warning',
  saved: 'bg-sky-600',
  closed: 'bg-success',
  canceled: 'bg-destructive',
  neutral: 'bg-muted-foreground',
};

const STRIPE_CLASS: Record<StatusTone, string> = {
  planned: 'bg-primary',
  open: 'bg-warning',
  saved: 'bg-sky-600',
  closed: 'bg-success',
  canceled: 'bg-destructive',
  neutral: 'bg-border',
};

const ACCENT_GRADIENT: Record<StatusTone, string> = {
  planned: 'from-primary/15 via-primary/5 to-transparent',
  open: 'from-warning/20 via-warning/5 to-transparent',
  saved: 'from-sky-500/15 via-sky-500/5 to-transparent',
  closed: 'from-success/15 via-success/5 to-transparent',
  canceled: 'from-destructive/15 via-destructive/5 to-transparent',
  neutral: 'from-muted-foreground/12 via-muted-foreground/5 to-transparent',
};

export function statusTone(statusId?: number | null, statusName?: string | null): StatusTone {
  if (statusId != null && TONE_BY_ID[statusId]) return TONE_BY_ID[statusId];
  if (!statusName) return 'neutral';
  return TONE_BY_NAME[statusName.toLowerCase()] ?? TONE_BY_NAME[statusName] ?? 'neutral';
}

export function statusDotClass(statusId?: number | null, statusName?: string | null): string {
  return DOT_CLASS[statusTone(statusId, statusName)];
}

export function statusStripeClassByStatus(
  statusId?: number | null,
  statusName?: string | null,
): string {
  return STRIPE_CLASS[statusTone(statusId, statusName)];
}

export function statusAccentGradientByStatus(
  statusId?: number | null,
  statusName?: string | null,
): string {
  return ACCENT_GRADIENT[statusTone(statusId, statusName)];
}
