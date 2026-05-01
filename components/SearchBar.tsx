'use client';

import { Search, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder, className }: Props) {
  return (
    <div className={`relative ${className ?? ''}`}>
      <Search
        size={15}
        className="text-muted-foreground/70 absolute top-1/2 left-3.5 -translate-y-1/2"
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-border bg-background text-foreground placeholder:text-muted-foreground/70 focus:border-ring focus:ring-ring/40 h-10 w-full rounded-xl border pr-10 pl-10 text-sm transition-all duration-200 focus:ring-2 focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="text-muted-foreground/70 hover:bg-muted hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded-md p-1 transition-colors"
          aria-label="Очистить"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
