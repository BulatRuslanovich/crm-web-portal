'use client';

import React, { useState, useEffect, forwardRef, useCallback } from 'react';
import { DayPicker } from 'react-day-picker';
import { ru } from 'react-day-picker/locale';
import { format, parse, isValid, setHours, setMinutes } from 'date-fns';
import * as Popover from '@radix-ui/react-popover';
import { Calendar, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';

import { cn } from '@/lib/utils';

const FMT_DISPLAY = 'dd.MM.yyyy HH:mm';
const FMT_VALUE = "yyyy-MM-dd'T'HH:mm";

function toDatetimeLocal(d: Date) {
  return format(d, FMT_VALUE);
}

interface DateTimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
}

export const DateTimePicker = forwardRef<HTMLInputElement, DateTimePickerProps>(
  ({ value, onChange, placeholder = 'Выберите дату и время', disabled, name }, ref) => {
    const [open, setOpen] = useState(false);

    const date = value ? parse(value, FMT_VALUE, new Date()) : null;
    const validDate = date && isValid(date) ? date : null;

    const [hours, setHoursVal] = useState(validDate ? validDate.getHours() : 9);
    const [minutes, setMinutesVal] = useState(validDate ? validDate.getMinutes() : 0);

    useEffect(() => {
      if (validDate) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHoursVal(validDate.getHours());
        setMinutesVal(validDate.getMinutes());
      }
    }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

    const commit = useCallback(
      (d: Date, h: number, m: number) => {
        const result = setMinutes(setHours(d, h), m);
        onChange?.(toDatetimeLocal(result));
      },
      [onChange],
    );

    function handleDaySelect(day: Date | undefined) {
      if (!day) return;
      commit(day, hours, minutes);
    }

    function handleHoursChange(h: number) {
      setHoursVal(h);
      if (validDate) commit(validDate, h, minutes);
    }

    function handleMinutesChange(m: number) {
      setMinutesVal(m);
      if (validDate) commit(validDate, hours, m);
    }

    function handleClear(e: React.MouseEvent) {
      e.stopPropagation();
      onChange?.('');
    }

    function handleToday() {
      const now = new Date();
      commit(now, hours, minutes);
    }

    function handleNow() {
      const now = new Date();
      const next = roundToNearestFiveMinutes(now);
      setHoursVal(next.getHours());
      setMinutesVal(next.getMinutes());
      onChange?.(toDatetimeLocal(next));
    }

    return (
      <>
        <input type="hidden" name={name} value={value ?? ''} ref={ref} />
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild disabled={disabled}>
            <button
              type="button"
              className={cn(
                'border-input flex h-10 w-full items-center gap-2 rounded-md border bg-transparent px-3 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'dark:bg-input/30',
              )}
            >
              <Calendar size={15} className="text-muted-foreground shrink-0" />
              {validDate ? (
                <span className="text-foreground flex-1">{format(validDate, FMT_DISPLAY)}</span>
              ) : (
                <span className="text-muted-foreground flex-1">{placeholder}</span>
              )}
              {validDate && (
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={handleClear}
                  className="text-muted-foreground hover:bg-accent hover:text-accent-foreground shrink-0 rounded-sm p-0.5"
                >
                  <X size={14} />
                </span>
              )}
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              sideOffset={6}
              align="start"
              className="animate-fade-in-scale bg-popover text-popover-foreground z-50 rounded-md border shadow-md"
            >
              <DayPicker
                mode="single"
                locale={ru}
                selected={validDate ?? undefined}
                onSelect={handleDaySelect}
                showOutsideDays
                fixedWeeks
                components={{
                  Chevron: ({ orientation }) =>
                    orientation === 'left' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />,
                }}
                classNames={{
                  root: 'p-3',
                  months: 'flex flex-col',
                  month: 'space-y-3',
                  month_caption: 'flex justify-center',
                  caption_label: 'text-sm font-medium capitalize',
                  nav: 'flex items-center justify-between absolute inset-x-3 top-3',
                  button_previous:
                    'h-7 w-7 flex items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors',
                  button_next:
                    'h-7 w-7 flex items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors',
                  weekdays: 'flex',
                  weekday: 'w-9 text-center text-xs font-medium text-muted-foreground',
                  week: 'flex mt-1',
                  day: 'text-center text-sm',
                  day_button:
                    'h-9 w-9 rounded-sm font-normal transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer',
                  selected:
                    '[&_.rdp-day_button]:bg-primary [&_.rdp-day_button]:text-primary-foreground [&_.rdp-day_button]:hover:bg-primary/90 [&_.rdp-day_button]:font-medium',
                  today:
                    '[&_.rdp-day_button]:border [&_.rdp-day_button]:border-primary [&_.rdp-day_button]:bg-primary/10 [&_.rdp-day_button]:text-foreground',
                  outside:
                    '[&_.rdp-day_button]:text-muted-foreground [&_.rdp-day_button]:opacity-40',
                }}
              />

              <div className="space-y-2 border-t px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <Clock size={15} className="text-muted-foreground shrink-0" />
                  <div className="flex items-center gap-1">
                    <TimeSelect value={hours} max={23} onChange={handleHoursChange} />
                    <span className="text-muted-foreground">:</span>
                    <TimeSelect value={minutes} max={59} step={5} onChange={handleMinutesChange} />
                  </div>
                </div>
                <div className="flex gap-1.5 pl-7">
                  <QuickButton onClick={handleToday}>Сегодня</QuickButton>
                  <QuickButton onClick={handleNow}>Сейчас</QuickButton>
                </div>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </>
    );
  },
);
DateTimePicker.displayName = 'DateTimePicker';

function QuickButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-sm border px-2 py-1 text-xs font-medium transition-colors"
    >
      {children}
    </button>
  );
}

function TimeSelect({
  value,
  max,
  step = 1,
  onChange,
}: {
  value: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  const options: number[] = [];
  for (let i = 0; i <= max; i += step) options.push(i);
  if (step > 1 && !options.includes(value)) options.push(value);
  options.sort((a, b) => a - b);

  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn(
        'border-input bg-popover text-popover-foreground h-8 rounded-sm border px-2 text-center text-sm tabular-nums transition-[color,box-shadow] outline-none',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'dark:bg-input/30',
      )}
    >
      {options.map((v) => (
        <option key={v} value={v} className="bg-popover text-popover-foreground">
          {String(v).padStart(2, '0')}
        </option>
      ))}
    </select>
  );
}

function roundToNearestFiveMinutes(date: Date): Date {
  const next = new Date(date);
  const minutes = next.getMinutes();
  const rounded = Math.round(minutes / 5) * 5;

  if (rounded === 60) {
    next.setHours(next.getHours() + 1, 0, 0, 0);
  } else {
    next.setMinutes(rounded, 0, 0);
  }

  return next;
}
