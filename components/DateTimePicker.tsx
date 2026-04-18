'use client';

import { useState, useEffect, forwardRef, useCallback } from 'react';
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
              className={cn(
                'flex h-10 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'dark:bg-input/30',
              )}
            >
              <Calendar size={15} className="shrink-0 text-muted-foreground" />
              {validDate ? (
                <span className="flex-1 text-foreground">{format(validDate, FMT_DISPLAY)}</span>
              ) : (
                <span className="flex-1 text-muted-foreground">{placeholder}</span>
              )}
              {validDate && (
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={handleClear}
                  className="shrink-0 rounded-sm p-0.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
              className="animate-fade-in-scale z-50 rounded-md border bg-popover text-popover-foreground shadow-md"
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
                  today: '[&_.rdp-day_button]:border [&_.rdp-day_button]:border-primary',
                  outside: '[&_.rdp-day_button]:text-muted-foreground [&_.rdp-day_button]:opacity-40',
                }}
              />

              <div className="flex items-center gap-3 border-t px-3 py-2.5">
                <Clock size={15} className="shrink-0 text-muted-foreground" />
                <div className="flex items-center gap-1">
                  <TimeSelect value={hours} max={23} onChange={handleHoursChange} />
                  <span className="text-muted-foreground">:</span>
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
      className={cn(
        'h-8 rounded-sm border border-input bg-transparent px-2 text-center text-sm tabular-nums text-foreground outline-none transition-[color,box-shadow]',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'dark:bg-input/30',
      )}
    >
      {options.map((v) => (
        <option key={v} value={v}>
          {String(v).padStart(2, '0')}
        </option>
      ))}
    </select>
  );
}
