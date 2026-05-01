import Link from 'next/link';
import { Building2, FileSpreadsheet, Stethoscope } from 'lucide-react';
import type { ActivResponse } from '@/lib/api/types';
import { STATUS_HEX } from '@/lib/api/statuses';
import { StatusBadge } from '@/components/ui';
import { formatShort } from '@/lib/format';
import { targetKind, targetLabel } from '@/lib/target';

const DEFAULT_COLOR = '#94a3b8';
const PREVIEW_LIMIT = 50;

function TargetCell({ activ }: { activ: ActivResponse }) {
  const kind = targetKind(activ);
  return (
    <Link
      href={`/activs/${activ.activId}`}
      className="flex items-center gap-2 font-medium text-foreground hover:underline"
    >
      {kind === 'phys' && <Stethoscope size={11} className="shrink-0 text-warning" />}
      {kind === 'org' && <Building2 size={11} className="shrink-0 text-success" />}
      <span className="truncate">{targetLabel(activ) || '—'}</span>
    </Link>
  );
}

function Row({ activ }: { activ: ActivResponse }) {
  const stripeColor = STATUS_HEX[activ.statusName.toLowerCase()] ?? DEFAULT_COLOR;
  return (
    <tr className="relative border-t border-border/60 transition-colors hover:bg-muted/50">
      <td className="relative px-4 py-2.5">
        <span
          className="absolute top-2 bottom-2 left-0 w-0.5 rounded-r-full"
          style={{ background: stripeColor }}
        />
        <TargetCell activ={activ} />
      </td>
      <td className="px-4 py-2.5">
        <StatusBadge name={activ.statusName} />
      </td>
      <td className="px-4 py-2.5 text-muted-foreground tabular-nums">
        {formatShort(activ.start)}
      </td>
      <td className="px-4 py-2.5 text-muted-foreground">{activ.usrLogin}</td>
      <td className="px-4 py-2.5 text-muted-foreground">
        {activ.drugs.length > 0 ? (
          <span className="truncate">{activ.drugs.map((d) => d.drugName).join(', ')}</span>
        ) : (
          <span className="text-muted-foreground/60">—</span>
        )}
      </td>
    </tr>
  );
}

const COLUMNS = ['Цель', 'Статус', 'Начало', 'Сотрудник', 'Препараты'];

export function PreviewTable({ activs }: { activs: ActivResponse[] }) {
  const shown = activs.slice(0, PREVIEW_LIMIT);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
        <FileSpreadsheet size={14} className="text-muted-foreground" />
        <p className="text-sm font-bold text-foreground">
          Предпросмотр
          {activs.length > PREVIEW_LIMIT && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              · первые {PREVIEW_LIMIT} из {activs.length}
            </span>
          )}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {COLUMNS.map((c) => (
                <th key={c} className="px-4 py-2.5 text-left font-semibold text-muted-foreground">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((a) => (
              <Row key={a.activId} activ={a} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
