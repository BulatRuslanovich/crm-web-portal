export const CHART_TOOLTIP = {
  contentStyle: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '0.75rem',
    fontSize: '12px',
    color: 'var(--foreground)',
  },
  cursor: { fill: 'var(--muted)' },
};

export const AXIS_TICK = { fontSize: 11, fill: 'var(--muted-foreground)' } as const;
export const AXIS_TICK_SMALL = { fontSize: 10, fill: 'var(--muted-foreground)' } as const;

export const PERIODS = [
  { value: 7, label: '7 дней' },
  { value: 30, label: '30 дней' },
  { value: 90, label: '90 дней' },
  { value: 365, label: 'Год' },
];

export function truncateTick(limit: number) {
  return (v: string) => (v.length > limit ? v.slice(0, limit - 2) + '…' : v);
}
