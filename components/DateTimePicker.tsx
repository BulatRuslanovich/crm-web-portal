'use client';

import { useState, useEffect, forwardRef, useCallback } from 'react';
import { DayPicker } from 'react-day-picker';
import { ru } from 'react-day-picker/locale';
import { format, parse, isValid, setHours, setMinutes } from 'date-fns';
import * as Popover from '@radix-ui/react-popover';
import { Calendar, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';

const FMT_DISPLAY = 'dd.MM.yyyy HH:mm';
const FMT_VALUE = "yyyy-MM-dd'T'HH:mm";

function toDatetimeLocal(d: Date) {
  return format(d, FMT_VALUE);
}

export interface DateTimePickerProps {
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

    return (
      <>
        <input type="hidden" name={name} value={value ?? ''} ref={ref} />
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild disabled={disabled}>
            <button
              type="button"
              className="flex h-10 w-full items-center gap-2 rounded-xl border border-(--border) bg-(--input-bg) px-3.5 text-left text-sm transition-all duration-200 focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/40 focus:outline-none disabled:opacity-50"
            >
              <Calendar size={15} className="shrink-0 text-(--fg-subtle)" />
              {validDate ? (
                <span className="flex-1 text-(--fg)">{format(validDate, FMT_DISPLAY)}</span>
              ) : (
                <span className="flex-1 text-(--fg-subtle)">{placeholder}</span>
              )}
              {validDate && (
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={handleClear}
                  className="shrink-0 rounded-md p-0.5 text-(--fg-subtle) hover:bg-(--surface-raised) hover:text-(--fg)"
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
              className="animate-fade-in-scale z-50 rounded-xl border border-(--border) bg-(--surface) shadow-lg"
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
                    orientation === 'left' ? (
                      <ChevronLeft size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    ),
                }}
                classNames={{
                  root: 'p-3',
                  months: 'flex flex-col',
                  month: 'space-y-3',
                  month_caption: 'flex justify-center',
                  caption_label: 'text-sm font-medium text-(--fg) capitalize',
                  nav: 'flex items-center justify-between absolute inset-x-3 top-3',
                  button_previous:
                    'h-7 w-7 flex items-center justify-center rounded-lg text-(--fg-muted) hover:bg-(--surface-raised) hover:text-(--fg) transition-colors',
                  button_next:
                    'h-7 w-7 flex items-center justify-center rounded-lg text-(--fg-muted) hover:bg-(--surface-raised) hover:text-(--fg) transition-colors',
                  weekdays: 'flex',
                  weekday: 'w-9 text-center text-xs font-medium text-(--fg-subtle)',
                  week: 'flex mt-1',
                  day: 'text-center text-sm',
                  day_button:
                    'h-9 w-9 rounded-lg font-normal transition-colors hover:bg-(--surface-raised) text-(--fg) cursor-pointer',
                  selected:
                    '[&_.rdp-day_button]:bg-(--primary) [&_.rdp-day_button]:text-(--primary-fg) [&_.rdp-day_button]:hover:bg-(--primary-hover) [&_.rdp-day_button]:font-medium',
                  today: '[&_.rdp-day_button]:border [&_.rdp-day_button]:border-(--primary-border)',
                  outside: '[&_.rdp-day_button]:text-(--fg-subtle) [&_.rdp-day_button]:opacity-40',
                }}
              />

              <div className="flex items-center gap-3 border-t border-(--border) px-3 py-2.5">
                <Clock size={15} className="shrink-0 text-(--fg-subtle)" />
                <div className="flex items-center gap-1">
                  <TimeSelect value={hours} max={23} onChange={handleHoursChange} />
                  <span className="text-(--fg-muted)">:</span>
                  <TimeSelect value={minutes} max={59} step={5} onChange={handleMinutesChange} />
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
      className="h-8 rounded-lg border border-(--border) bg-(--input-bg) px-2 text-center text-sm tabular-nums text-(--fg) focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/40 focus:outline-none"
    >
      {options.map((v) => (
        <option key={v} value={v}>
          {String(v).padStart(2, '0')}
        </option>
      ))}
    </select>
  );
}
