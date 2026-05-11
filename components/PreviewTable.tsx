import Link from 'next/link';
import { Building2, FileSpreadsheet, Stethoscope } from 'lucide-react';
import type { ActivResponse } from '@/lib/api/types';
import { STATUS_HEX } from '@/lib/api/statuses';
import { StatusBadge } from '@/components/ui';
import { formatShort } from '@/lib/format';
import { targetKind, targetLabel } from '@/lib/activ-helper';

const DEFAULT_COLOR = '#94a3b8';
const PREVIEW_LIMIT = 50;

function TargetCell({ activ }: { activ: ActivResponse }) {
  const kind = targetKind(activ);
  return (
    <Link
      href={`/activs/${activ.activId}`}
      className="text-foreground flex items-center gap-2 font-medium hover:underline"
    >
      {kind === 'phys' && <Stethoscope size={11} className="text-warning shrink-0" />}
      {kind === 'org' && <Building2 size={11} className="text-success shrink-0" />}
      <span className="truncate">{targetLabel(activ) || '—'}</span>
    </Link>
  );
}

function Row({ activ }: { activ: ActivResponse }) {
  const stripeColor = STATUS_HEX[activ.statusName.toLowerCase()] ?? DEFAULT_COLOR;
  return (
    <tr className="border-border/60 hover:bg-muted/50 relative border-t transition-colors">
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
      <td className="text-muted-foreground px-4 py-2.5 tabular-nums">{formatShort(activ.start)}</td>
      <td className="text-muted-foreground px-4 py-2.5">{activ.usrLogin}</td>
      <td className="text-muted-foreground px-4 py-2.5">
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
    <div className="border-border bg-card overflow-hidden rounded-2xl border">
      <div className="border-border flex items-center gap-2 border-b px-5 py-3.5">
        <FileSpreadsheet size={14} className="text-muted-foreground" />
        <p className="text-foreground text-sm font-bold">
          Предпросмотр
          {activs.length > PREVIEW_LIMIT && (
            <span className="text-muted-foreground ml-2 text-xs font-normal">
              · первые {PREVIEW_LIMIT} из {activs.length}
            </span>
          )}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-border bg-muted/40 border-b">
              {COLUMNS.map((c) => (
                <th key={c} className="text-muted-foreground px-4 py-2.5 text-left font-semibold">
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
