'use client';

import { useState, useRef, useEffect, forwardRef } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ChevronDown, Search, Check, X, Loader2 } from 'lucide-react';

export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
}

export interface ComboboxProps {
  /** Sync mode: pass a static list. */
  options?: ComboboxOption[];
  /** Async mode: fetcher called with query (empty on open). Must return options. */
  asyncSearch?: (query: string) => Promise<ComboboxOption[]>;
  /** Async mode: full option object for the current `value` (for display when not in search results). */
  selectedOption?: ComboboxOption;

  value?: string;
  onChange?: (value: string, option?: ComboboxOption) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  name?: string;
}

export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(
  (
    {
      options: staticOptions,
      asyncSearch,
      selectedOption,
      value,
      onChange,
      placeholder = 'Выберите...',
      searchPlaceholder = 'Поиск...',
      emptyMessage = 'Ничего не найдено',
      disabled,
      name,
    },
    ref,
  ) => {
    const isAsync = !!asyncSearch;
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [asyncOptions, setAsyncOptions] = useState<ComboboxOption[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const options = isAsync ? asyncOptions : (staticOptions ?? []);

    const selected =
      (isAsync ? selectedOption : undefined) ?? options.find((o) => o.value === value);

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

    function handleSelect(opt: ComboboxOption) {
      const next = opt.value === value ? '' : opt.value;
      onChange?.(next, next ? opt : undefined);
      setOpen(false);
    }

    function handleClear(e: React.MouseEvent) {
      e.stopPropagation();
      onChange?.('', undefined);
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
              {selected ? (
                <span className="flex-1 truncate text-(--fg)">{selected.label}</span>
              ) : (
                <span className="flex-1 truncate text-(--fg-subtle)">{placeholder}</span>
              )}
              {selected ? (
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={handleClear}
                  className="shrink-0 rounded-md p-0.5 text-(--fg-subtle) hover:bg-(--surface-raised) hover:text-(--fg)"
                >
                  <X size={14} />
                </span>
              ) : (
                <ChevronDown
                  size={15}
                  className={`shrink-0 text-(--fg-subtle) transition-transform ${open ? 'rotate-180' : ''}`}
                />
              )}
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
              </div>

              <div className="max-h-56 overflow-y-auto p-1">
                {filtered.length === 0 ? (
                  <p className="px-3 py-4 text-center text-sm text-(--fg-muted)">
                    {isAsync && loading ? 'Поиск...' : emptyMessage}
                  </p>
                ) : (
                  filtered.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt)}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-(--surface-raised)"
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center ${value === opt.value ? 'text-(--primary)' : 'text-transparent'}`}
                      >
                        <Check size={14} strokeWidth={2.5} />
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
                  ))
                )}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </>
    );
  },
);
Combobox.displayName = 'Combobox';
