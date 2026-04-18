import { useMemo } from 'react';
import { Flame } from 'lucide-react';
import type { ActivResponse } from '@/lib/api/types';
import { Skeleton } from '@/components/ui';
import { ToneIcon } from '../../_components/ToneIcon';
import { buildHeatmap, type HeatmapStats } from '../_lib/heatmap';
import { HeatmapGrid } from './HeatmapGrid';

function HeaderStats({ stats }: { stats: HeatmapStats }) {
  return (
    <div className="flex items-center gap-4 text-xs">
      <div className="text-right">
        <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
          Всего
        </p>
        <p className="font-bold text-foreground tabular-nums">{stats.total}</p>
      </div>
      <div className="text-right">
        <p className="flex items-center justify-end gap-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
          <Flame size={10} className={stats.streak > 0 ? 'text-success' : ''} />
          Серия
        </p>
        <p className="font-bold text-foreground tabular-nums">{stats.streak} дн.</p>
      </div>
    </div>
  );
}

export function HeatmapSection({
  activs,
  loading,
}: {
  activs: ActivResponse[];
  loading?: boolean;
}) {
  const stats = useMemo(() => buildHeatmap(activs), [activs]);

  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <ToneIcon icon={Flame} tone="success" />
          <div>
            <h3 className="text-sm font-bold text-foreground">Активность</h3>
            <p className="text-xs text-muted-foreground">Закрытые визиты за год</p>
          </div>
        </div>
        <HeaderStats stats={stats} />
      </div>

      {loading ? (
        <Skeleton className="m-5 h-28 rounded-xl" />
      ) : (
        <div className="px-5 py-4">
          <HeatmapGrid stats={stats} />
        </div>
      )}
    </section>
  );
}
