'use client';

import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { AuditAction } from '@/lib/api/types';

const VALUE_TRUNCATE = 80;

const ENTITY_LABEL: Record<string, string> = {
  activ: 'Визит',
  org: 'Организация',
  phys: 'Врач',
};

const ENTITY_ROUTE: Record<string, string> = {
  activ: '/activs',
  org: '/orgs',
  phys: '/physes',
};

export function ActionBadge({ action }: { action: AuditAction }) {
  const styles = ACTION_STYLES[action];
  const Icon = styles.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${styles.cls}`}
    >
      <Icon size={10} />
      {action}
    </span>
  );
}

const ACTION_STYLES: Record<AuditAction, { cls: string; icon: React.ElementType }> = {
  INSERT: {
    cls: 'border-success/40 bg-success/10 text-success',
    icon: Plus,
  },
  UPDATE: {
    cls: 'border-primary/40 bg-primary/10 text-primary',
    icon: Pencil,
  },
  DELETE: {
    cls: 'border-destructive/40 bg-destructive/10 text-destructive',
    icon: Trash2,
  },
};

export function EntityLink({ type, id }: { type: string; id: number }) {
  const label = ENTITY_LABEL[type] ?? type;
  const route = ENTITY_ROUTE[type];
  if (!route) {
    return (
      <span className="text-foreground">
        {label} <span className="text-muted-foreground">#{id}</span>
      </span>
    );
  }
  return (
    <Link
      href={`${route}/${id}`}
      className="text-foreground inline-flex items-center gap-1 hover:underline"
    >
      <span>{label}</span>
      <span className="text-muted-foreground">#{id}</span>
    </Link>
  );
}

export function ValueCell({ value }: { value: string | null }) {
  if (value == null) return <span className="text-muted-foreground/60">—</span>;
  if (value.length <= VALUE_TRUNCATE) {
    return <span className="text-foreground font-mono break-all">{value}</span>;
  }
  const truncated = value.slice(0, VALUE_TRUNCATE) + '…';
  return (
    <span className="text-foreground font-mono break-all" title={value}>
      {truncated}
    </span>
  );
}
