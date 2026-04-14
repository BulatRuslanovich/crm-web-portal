'use client';

import { useState, useRef, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ChevronDown, Search, Check, X, Loader2 } from 'lucide-react';

export interface MultiComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
}

export interface MultiComboboxProps {
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
          className="flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-xl border border-(--border) bg-(--input-bg) px-3 py-1.5 text-left text-sm transition-all duration-200 focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/40 focus:outline-none disabled:opacity-50"
        >
          {selectedLabels.length > 0 ? (
            <>
              {selectedLabels.map((o) => (
                <span
                  key={o.value}
                  className="inline-flex items-center gap-1 rounded-lg bg-(--primary-subtle) px-2 py-0.5 text-xs font-medium text-(--primary-text)"
                >
                  {o.label}
                  <span
                    role="button"
                    tabIndex={-1}
                    onClick={(e) => remove(o.value, e)}
                    className="rounded p-0.5 transition-colors hover:bg-(--primary-border)/30"
                  >
                    <X size={11} />
                  </span>
                </span>
              ))}
            </>
          ) : (
            <span className="flex-1 py-0.5 text-(--fg-subtle)">{placeholder}</span>
          )}
          <ChevronDown
            size={15}
            className={`ml-auto shrink-0 text-(--fg-subtle) transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={6}
          align="start"
          className="animate-fade-in-scale z-50 w-(--radix-popover-trigger-width) rounded-xl border border-(--border) bg-(--surface) shadow-lg"
        >
          <div className="flex items-center gap-2 border-b border-(--border) px-3 py-2">
            <Search size={15} className="shrink-0 text-(--fg-subtle)" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm text-(--fg) placeholder:text-(--fg-subtle) focus:outline-none"
            />
            {isAsync && loading && (
              <Loader2 size={14} className="shrink-0 animate-spin text-(--fg-subtle)" />
            )}
            {value.length > 0 && (
              <span className="shrink-0 rounded-md bg-(--primary-subtle) px-1.5 py-0.5 text-xs tabular-nums text-(--primary-text)">
                {value.length}
              </span>
            )}
          </div>

          <div className="max-h-56 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-(--fg-muted)">
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
                    className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-(--surface-raised) ${isSelected ? 'bg-(--primary-subtle)/50' : ''}`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${isSelected ? 'border-(--primary) bg-(--primary) text-(--primary-fg)' : 'border-(--border) text-transparent'}`}
                    >
                      <Check size={11} strokeWidth={3} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-(--fg)">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="block truncate text-xs text-(--fg-muted)">
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
            <div className="border-t border-(--border) p-1">
              <button
                type="button"
                onClick={clearAll}
                className="w-full cursor-pointer rounded-lg px-2.5 py-1.5 text-center text-xs text-(--fg-muted) transition-colors hover:bg-(--surface-raised) hover:text-(--danger-text)"
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
