export const CHART_CURSOR = {
  fill: 'var(--muted)',
  fillOpacity: 0.3,
} as const;

export const AXIS_TICK = {
  fontSize: 11,
  fill: 'var(--muted-foreground)',
  letterSpacing: '-0.01em',
} as const;
export const AXIS_TICK_SMALL = {
  fontSize: 10,
  fill: 'var(--muted-foreground)',
  letterSpacing: '-0.01em',
} as const;

export const CHART_GRID = {
  stroke: 'var(--border)',
  strokeOpacity: 1,
} as const;

export const PERIODS = [
  { value: 7, label: '7 дней' },
  { value: 30, label: '30 дней' },
  { value: 90, label: '90 дней' },
  { value: 365, label: 'Год' },
];

export function truncateTick(limit: number) {
  return (v: string) => (v.length > limit ? v.slice(0, limit - 2) + '…' : v);
}
