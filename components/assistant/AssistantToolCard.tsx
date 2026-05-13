'use client';

import Link from 'next/link';
import { ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getToolMeta } from './tool-meta';
import type { ToolCall } from '@/lib/hooks/use-assistant-chat';

interface ParsedItem {
  id: number | string;
  primary: string;
  secondary?: string;
  href?: string;
}

function parseResult(name: string, resultJson: string): ParsedItem[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(resultJson);
  } catch {
    return [];
  }
  const items = Array.isArray(parsed)
    ? parsed
    : Array.isArray((parsed as { items?: unknown[] })?.items)
      ? (parsed as { items: unknown[] }).items
      : [];

  if (!items.length) return [];

  return items.slice(0, 8).map((raw): ParsedItem => {
    const r = raw as Record<string, unknown>;

    if (name === 'search_drugs' || name === 'get_drug_details') {
      const id = (r.drugId ?? r.id) as number | string;
      const primary = String(r.drugName ?? r.name ?? `#${id}`);
      const brand = r.brand ? String(r.brand) : undefined;
      const form = r.form ? String(r.form) : undefined;
      const secondary = [brand, form].filter(Boolean).join(' • ') || undefined;
      return { id, primary, secondary };
    }

    if (name === 'search_physes' || name === 'get_phys_details') {
      const id = (r.physId ?? r.id) as number | string;
      const fio = [r.lastName, r.firstName, r.middleName].filter(Boolean).join(' ').trim();
      const primary = fio || String(r.fullName ?? `#${id}`);
      const secondary = r.specName ? String(r.specName) : undefined;
      return { id, primary, secondary, href: id != null ? `/physes/${id}` : undefined };
    }

    if (name === 'search_orgs' || name === 'get_org_details') {
      const id = (r.orgId ?? r.id) as number | string;
      const primary = String(r.orgName ?? r.name ?? `#${id}`);
      const secondary = [r.orgTypeName, r.address].filter(Boolean).join(' • ') || undefined;
      return { id, primary, secondary, href: id != null ? `/orgs/${id}` : undefined };
    }

    if (name === 'list_activs' || name === 'get_activ_details') {
      const id = (r.activId ?? r.id) as number | string;
      const date = r.start
        ? new Date(String(r.start)).toLocaleString('ru-RU', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '';
      const who = r.physName ?? r.orgName ?? '';
      const primary = `Визит #${id}${who ? ` · ${who}` : ''}`;
      const secondary = [date, r.statusName].filter(Boolean).join(' • ') || undefined;
      return { id, primary, secondary, href: id != null ? `/activs/${id}` : undefined };
    }

    const id = (r.id ?? Math.random()) as number | string;
    const primary = String(r.name ?? r.title ?? JSON.stringify(r));
    return { id, primary };
  });
}

export function AssistantToolCard({
  tool,
  onNavigate,
}: {
  tool: ToolCall;
  onNavigate?: () => void;
}) {
  const meta = getToolMeta(tool.name);
  const Icon = meta.icon;

  if (tool.status === 'running') {
    return (
      <div className="border-border bg-muted text-muted-foreground my-1.5 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium">
        <Loader2 className="size-3 animate-spin" />
        <span>{meta.runningLabel}</span>
      </div>
    );
  }

  if (tool.status === 'error') {
    return (
      <div className="border-destructive/40 bg-destructive/5 text-destructive my-1.5 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs">
        <Icon className="size-3.5" />
        <span>{meta.doneLabel}: ошибка</span>
      </div>
    );
  }

  const items = tool.resultJson ? parseResult(tool.name, tool.resultJson) : [];

  return (
    <div className="border-border bg-card my-2 overflow-hidden rounded-lg border">
      <div className="text-muted-foreground border-border bg-muted/40 flex items-center gap-1.5 border-b px-2.5 py-1.5 text-[11px] font-semibold tracking-wide uppercase">
        <span className="bg-background text-muted-foreground border-border flex size-4 items-center justify-center rounded border">
          <Icon className="size-2.5" />
        </span>
        <span>{meta.doneLabel}</span>
        {items.length > 0 && (
          <span className="text-muted-foreground/70 bg-muted ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium tracking-normal normal-case">
            {items.length}
          </span>
        )}
      </div>
      {items.length === 0 ? (
        <div className="text-muted-foreground px-2.5 py-2 text-xs italic">Ничего не найдено</div>
      ) : (
        <ul className="divide-border/40 divide-y">
          {items.map((it) => {
            const inner = (
              <div className="flex items-center gap-2 px-2.5 py-1.5 text-xs">
                <div className="min-w-0 flex-1">
                  <div className="text-foreground truncate font-medium">{it.primary}</div>
                  {it.secondary && (
                    <div className="text-muted-foreground mt-0.5 truncate text-[11px]">
                      {it.secondary}
                    </div>
                  )}
                </div>
                {it.href && (
                  <ChevronRight className="text-muted-foreground/60 size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                )}
              </div>
            );
            return (
              <li key={String(it.id)}>
                {it.href ? (
                  <Link
                    href={it.href}
                    onClick={onNavigate}
                    className={cn('group hover:bg-muted/60 block transition-colors')}
                  >
                    {inner}
                  </Link>
                ) : (
                  inner
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
