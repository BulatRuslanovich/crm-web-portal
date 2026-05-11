import { useMemo } from 'react';
import { Flame } from 'lucide-react';
import type { ActivResponse } from '@/lib/api/types';
import { Skeleton } from '@/components/ui';
import { ToneIcon } from '@/components/ToneIcon';
import { buildHeatmap, type HeatmapStats } from '@/lib/heatmap';
import { HeatmapGrid } from './HeatmapGrid';

function HeaderStats({ stats }: { stats: HeatmapStats }) {
  return (
    <div className="flex items-center gap-4 text-xs">
      <div className="text-right">
        <p className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
          Всего
        </p>
        <p className="text-foreground font-bold tabular-nums">{stats.total}</p>
      </div>
      <div className="text-right">
        <p className="text-muted-foreground flex items-center justify-end gap-1 text-[10px] font-bold tracking-wider uppercase">
          <Flame size={10} className={stats.streak > 0 ? 'text-emerald-500' : ''} />
          Серия
        </p>
        <p className="text-foreground font-bold tabular-nums">{stats.streak} дн.</p>
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
    <section className="border-border bg-card rounded-2xl border">
      <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div className="flex items-center gap-3">
          <ToneIcon icon={Flame} tone="success" solid />
          <div>
            <h3 className="text-foreground text-sm font-bold">Активность</h3>
            <p className="text-muted-foreground text-xs">Закрытые визиты за год</p>
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
