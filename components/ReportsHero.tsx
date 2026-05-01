import { FileDown, FileSpreadsheet } from 'lucide-react';
import { BtnPrimary, BtnSuccess } from '@/components/ui';
import { ToneIcon } from '@/components/ToneIcon';

export function ReportsHero({
  loading,
  totalCount,
  filteredCount,
  dateFrom,
  dateTo,
  onExportXlsx,
  onExportCsv,
}: {
  loading: boolean;
  totalCount: number | null;
  filteredCount: number;
  dateFrom: string;
  dateTo: string;
  onExportXlsx: () => void;
  onExportCsv: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-muted to-card shadow-sm">
      <div className="relative flex flex-wrap items-start justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <ToneIcon icon={FileDown} tone="primary" size="lg" />
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Отчёты
            </p>
            <h2 className="text-xl font-bold text-foreground">Экспорт визитов</h2>
            {!loading && totalCount !== null && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {filteredCount}
                {filteredCount !== totalCount && ` из ${totalCount}`} визитов ·{' '}
                {dateFrom} → {dateTo}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <BtnSuccess onClick={onExportXlsx} disabled={loading || filteredCount === 0}>
            <FileSpreadsheet size={15} />
            Excel
            <span className="ml-1 rounded-full bg-success-foreground/20 px-2 py-0.5 text-[11px] font-bold tabular-nums">
              {filteredCount}
            </span>
          </BtnSuccess>
          <BtnPrimary onClick={onExportCsv} disabled={loading || filteredCount === 0}>
            <FileDown size={15} />
            CSV
          </BtnPrimary>
        </div>
      </div>
    </div>
  );
}
