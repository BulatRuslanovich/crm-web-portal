import { MONTHS_ABBR } from '@/lib/ru-dates';

const LEVEL_BG = [
  'bg-muted/40',
  'bg-emerald-500/35',
  'bg-emerald-500/60',
  'bg-emerald-500/85',
  'bg-emerald-400 shadow-emerald-500/40',
];

function pluralizeClosed(count: number): string {
  if (count === 1) return 'закрыт визит';
  if (count < 5) return 'закрытых визита';
  return 'закрытых визитов';
}

function tooltipFor(date: Date, count: number): string {
  const base = `${date.getDate()} ${MONTHS_ABBR[date.getMonth()]}`;
  if (count === 0) return `${base}: нет закрытых`;
  return `${base}: ${count} ${pluralizeClosed(count)}`;
}

export function HeatmapCell({
  count,
  max,
  date,
}: {
  count: number | null;
  max: number;
  date?: Date;
}) {
  if (count === null) return <div className="aspect-square w-full" />;
  const level = count === 0 ? 0 : Math.min(4, Math.ceil((count / Math.max(max, 1)) * 4));
  const title = date ? tooltipFor(date, count) : '';

  return (
    <div
      title={title}
      className={`ring-border/40 aspect-square w-full rounded-[3px] ring-1 transition-transform hover:scale-110 ${LEVEL_BG[level]}`}
    />
  );
}
