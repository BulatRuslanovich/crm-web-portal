'use client';

import { Ban, Check } from 'lucide-react';
import {
  STATUS_CANCELED,
  STATUS_CLOSED,
  STATUS_OPEN,
  STATUS_PLANNED,
  STATUS_SAVED,
} from '@/lib/api/statuses';

interface Step {
  id: number;
  label: string;
}

const STATUS_FLOW: Step[] = [
  { id: STATUS_PLANNED, label: 'Запланирован' },
  { id: STATUS_OPEN, label: 'Открыт' },
  { id: STATUS_SAVED, label: 'Сохранен' },
  { id: STATUS_CLOSED, label: 'Закрыт' },
];

interface Props {
  currentStatusId: number;
}

export function StatusStepper({ currentStatusId }: Props) {
  if (currentStatusId === STATUS_CANCELED) {
    return (
      <div className="border-border text-muted-foreground flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium tracking-tight">
        <Ban size={12} strokeWidth={1.5} className="text-destructive/80" />
        Визит отменён
      </div>
    );
  }

  const currentIdx = STATUS_FLOW.findIndex((s) => s.id === currentStatusId);

  return (
    <div className="flex items-center gap-1">
      {STATUS_FLOW.map((step, i) => (
        <div key={step.id} className="flex flex-1 items-center gap-1">
          <StepMarker step={step} index={i} currentIdx={currentIdx} />
          {i < STATUS_FLOW.length - 1 && <StepConnector active={i < currentIdx} />}
        </div>
      ))}
    </div>
  );
}

function StepMarker({
  step,
  index,
  currentIdx,
}: {
  step: Step;
  index: number;
  currentIdx: number;
}) {
  const reached = currentIdx >= 0 && index <= currentIdx;
  const isCurrent = index === currentIdx;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-medium tabular-nums transition-colors ${markerClass(isCurrent, reached)}`}
      >
        {reached && !isCurrent ? <Check size={11} strokeWidth={2} /> : index + 1}
      </div>
      <span
        className={`text-[10px] font-medium tracking-tight whitespace-nowrap ${reached ? 'text-foreground/80' : 'text-muted-foreground/60'}`}
      >
        {step.label}
      </span>
    </div>
  );
}

function StepConnector({ active }: { active: boolean }) {
  return (
    <div
      className={`mb-5 h-px flex-1 transition-colors ${
        active ? 'bg-foreground/30' : 'bg-border'
      }`}
    />
  );
}

function markerClass(isCurrent: boolean, reached: boolean): string {
  if (isCurrent) return 'border-foreground/40 bg-foreground text-background';
  if (reached) return 'border-foreground/30 bg-foreground/[0.08] text-foreground';
  return 'border-border text-muted-foreground/60';
}
