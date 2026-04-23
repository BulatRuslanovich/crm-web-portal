import { Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

type ThemeOption = { value: 'light' | 'dark' | 'system'; icon: React.ElementType; label: string };

const OPTIONS: ThemeOption[] = [
  { value: 'light', icon: Sun, label: 'Светлая' },
  { value: 'dark', icon: Moon, label: 'Тёмная' },
  { value: 'system', icon: Monitor, label: 'Авто' },
];

function nextTheme(current: string | undefined): ThemeOption['value'] {
  if (current === 'light') return 'dark';
  if (current === 'dark') return 'system';
  return 'light';
}

function CompactCycleButton({
  theme,
  onChange,
}: {
  theme: string | undefined;
  onChange: (v: string) => void;
}) {
  const active = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[2];
  const Icon = active.icon;
  return (
    <button
      type="button"
      onClick={() => onChange(nextTheme(theme))}
      title={`Тема: ${active.label}`}
      className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
    >
      <Icon size={18} strokeWidth={1.75} />
    </button>
  );
}

function SegmentedSwitch({
  theme,
  onChange,
}: {
  theme: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex rounded-lg border border-sidebar-border bg-sidebar-accent/30 p-0.5">
      {OPTIONS.map((opt) => {
        const active = theme === opt.value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            title={opt.label}
            className={cn(
              'flex flex-1 cursor-pointer items-center justify-center rounded-md py-1.5 transition-all',
              active
                ? 'bg-sidebar text-sidebar-foreground shadow-sm'
                : 'text-muted-foreground hover:text-sidebar-accent-foreground',
            )}
          >
            <Icon size={15} strokeWidth={active ? 2.25 : 1.75} />
          </button>
        );
      })}
    </div>
  );
}

export function SidebarThemeSwitch({
  theme,
  onChange,
  compact,
}: {
  theme: string | undefined;
  onChange: (v: string) => void;
  compact: boolean;
}) {
  return compact ? (
    <CompactCycleButton theme={theme} onChange={onChange} />
  ) : (
    <SegmentedSwitch theme={theme} onChange={onChange} />
  );
}
