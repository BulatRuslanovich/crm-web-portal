import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
        className="group hover-glow border-border bg-card block rounded-2xl border p-5 transition-all duration-200"
      >
        <div className="mb-3 flex items-center justify-between">
          <ToneIcon icon={icon} tone={tone} />
          <ArrowRight
            size={15}
            className="text-muted-foreground/50 group-hover:text-foreground transition-transform group-hover:translate-x-0.5"
          />
        </div>
        {loading ? (
          <Skeleton className="mb-1 h-9 w-20" />
        ) : (
          <p className="text-foreground text-3xl font-bold tracking-tight tabular-nums">{value}</p>
        )}
        <p className="text-muted-foreground text-sm">{label}</p>
      </Link>
    </HoverCard>
  );
}
