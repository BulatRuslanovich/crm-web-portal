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
      <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold">
        <Ban size={13} />
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
        className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${markerClass(isCurrent, reached)}`}
      >
        {reached && !isCurrent ? <Check size={11} /> : index + 1}
      </div>
      <span
        className={`text-[10px] font-medium whitespace-nowrap ${reached ? 'text-foreground' : 'text-muted-foreground/70'}`}
      >
        {step.label}
      </span>
    </div>
  );
}

function StepConnector({ active }: { active: boolean }) {
  return (
    <div
      className={`mb-5 h-0.5 flex-1 rounded-full transition-colors ${
        active ? 'bg-primary/70' : 'bg-border'
      }`}
    />
  );
}

function markerClass(isCurrent: boolean, reached: boolean): string {
  if (isCurrent) return 'bg-primary text-primary-foreground ring-2 ring-primary/30';
  if (reached) return 'bg-primary/80 text-primary-foreground';
  return 'bg-muted text-muted-foreground/60';
}
