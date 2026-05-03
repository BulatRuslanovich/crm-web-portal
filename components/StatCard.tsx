import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Skeleton } from '@/components/ui';
import { HoverCard } from '@/components/motion';
import { ToneIcon } from '@/components/ToneIcon';
import type { Tone } from '@/lib/tone';
import React from 'react';

export function StatCard({
  label,
  value,
  href,
  loading,
  icon,
  tone,
}: {
  label: string;
  value: number;
  href: string;
  loading?: boolean;
  icon: React.ElementType;
  tone: Tone;
}) {
  return (
    <HoverCard>
      <Link
        href={href}
        className="group hover-glow border-border bg-card relative flex items-center gap-4 overflow-hidden rounded-2xl border p-4 transition-all duration-200"
      >
        <ToneIcon icon={icon} tone={tone} size="lg" solid />
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {label}
          </p>
          {loading ? (
            <Skeleton className="mt-1 h-7 w-16" />
          ) : (
            <p className="text-foreground text-2xl font-bold tabular-nums">{value}</p>
          )}
        </div>
        <ArrowUpRight
          size={16}
          className="text-muted-foreground/40 group-hover:text-foreground shrink-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </Link>
    </HoverCard>
  );
}
