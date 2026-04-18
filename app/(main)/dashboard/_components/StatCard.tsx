import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui';
import { HoverCard } from '@/components/motion';
import { ToneIcon } from '../../_components/ToneIcon';
import type { Tone } from '../../_lib/tone';

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
        className="group hover-glow block rounded-2xl border border-border bg-card p-5 transition-all duration-200"
      >
        <div className="mb-3 flex items-center justify-between">
          <ToneIcon icon={icon} tone={tone} />
          <ArrowRight
            size={15}
            className="text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
          />
        </div>
        {loading ? (
          <Skeleton className="mb-1 h-9 w-20" />
        ) : (
          <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">{value}</p>
        )}
        <p className="text-sm text-muted-foreground">{label}</p>
      </Link>
    </HoverCard>
  );
}
