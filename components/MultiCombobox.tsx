'use client';

import React, { useState, useRef, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ChevronDown, Search, Check, X, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface MultiComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface MultiComboboxProps {
  /** Sync mode: static list. */
  options?: MultiComboboxOption[];
  /** Async mode: fetcher called with query. */
  asyncSearch?: (query: string) => Promise<MultiComboboxOption[]>;
  /** Async mode: full option objects for values currently in `value` (for pill display). */
  selectedOptions?: MultiComboboxOption[];

  value: string[];
  onChange: (value: string[], options?: MultiComboboxOption[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
}

export function MultiCombobox({
  options: staticOptions,
  asyncSearch,
  selectedOptions,
  value,
  onChange,
  placeholder = 'Выберите...',
  searchPlaceholder = 'Поиск...',
  emptyMessage = 'Ничего не найдено',
  disabled,
}: MultiComboboxProps) {
  const isAsync = !!asyncSearch;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [asyncOptions, setAsyncOptions] = useState<MultiComboboxOption[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const options = isAsync ? asyncOptions : (staticOptions ?? []);

  const selectedLabels: MultiComboboxOption[] = isAsync
    ? (selectedOptions ?? []).filter((o) => value.includes(o.value))
    : options.filter((o) => value.includes(o.value));

  const filtered =
    isAsync || !query
      ? options
      : options.filter(
          (o) =>
            o.label.toLowerCase().includes(query.toLowerCase()) ||
            o.sublabel?.toLowerCase().includes(query.toLowerCase()),
        );

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    if (!isAsync || !open) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await asyncSearch!(query);
        if (!cancelled) setAsyncOptions(results);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [isAsync, open, query, asyncSearch]);

  function toggle(opt: MultiComboboxOption) {
    const has = value.includes(opt.value);
    const nextValue = has ? value.filter((v) => v !== opt.value) : [...value, opt.value];
    if (isAsync) {
      const base = selectedOptions ?? [];
      const nextOpts = has
        ? base.filter((o) => o.value !== opt.value)
        : base.some((o) => o.value === opt.value)
          ? base
          : [...base, opt];
      onChange(nextValue, nextOpts);
    } else {
      onChange(nextValue);
    }
  }

  function remove(val: string, e: React.MouseEvent) {
    e.stopPropagation();
    const nextValue = value.filter((v) => v !== val);
    if (isAsync) {
      const nextOpts = (selectedOptions ?? []).filter((o) => o.value !== val);
      onChange(nextValue, nextOpts);
    } else {
      onChange(nextValue);
    }
  }

  function clearAll() {
    if (isAsync) onChange([], []);
    else onChange([]);
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            'border-input flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border bg-transparent px-3 py-1.5 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:bg-input/30',
          )}
        >
          {selectedLabels.length > 0 ? (
            selectedLabels.map((o) => (
              <span
                key={o.value}
                className="bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium"
              >
                {o.label}
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={(e) => remove(o.value, e)}
                  className="hover:bg-accent rounded p-0.5 transition-colors"
                >
                  <X size={11} />
                </span>
              </span>
            ))
          ) : (
            <span className="text-muted-foreground flex-1 py-0.5">{placeholder}</span>
          )}
          <ChevronDown
            size={15}
            className={cn(
              'text-muted-foreground ml-auto shrink-0 transition-transform',
              open && 'rotate-180',
            )}
          />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={6}
          align="start"
          className="animate-fade-in-scale bg-popover text-popover-foreground z-50 w-(--radix-popover-trigger-width) rounded-md border shadow-md"
        >
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search size={15} className="text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-sm focus:outline-none"
            />
            {isAsync && loading && (
              <Loader2 size={14} className="text-muted-foreground shrink-0 animate-spin" />
            )}
            {value.length > 0 && (
              <span className="bg-secondary text-secondary-foreground shrink-0 rounded-sm px-1.5 py-0.5 text-xs tabular-nums">
                {value.length}
              </span>
            )}
          </div>

          <div className="max-h-56 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="text-muted-foreground px-3 py-4 text-center text-sm">
                {isAsync && loading ? 'Поиск...' : emptyMessage}
              </p>
            ) : (
              filtered.map((opt) => {
                const isSelected = value.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggle(opt)}
                    className={cn(
                      'hover:bg-accent hover:text-accent-foreground flex w-full cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-sm transition-colors',
                      isSelected && 'bg-accent/50',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-4 shrink-0 items-center justify-center rounded-sm border transition-colors',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input text-transparent',
                      )}
                    >
                      <Check size={11} strokeWidth={3} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-foreground block truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-muted-foreground block truncate text-xs">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {value.length > 0 && (
            <div className="border-t p-1">
              <button
                type="button"
                onClick={clearAll}
                className="text-muted-foreground hover:bg-accent hover:text-destructive w-full cursor-pointer rounded-sm px-2.5 py-1.5 text-center text-xs transition-colors"
              >
                Очистить все
              </button>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
