import React from 'react';

export function RegistryToolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border bg-card/80 space-y-2 rounded-xl border p-2.5 shadow-xs">
      {children}
    </div>
  );
}
