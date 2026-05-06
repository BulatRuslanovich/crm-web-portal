import { cn } from '@/lib/utils';
import React from 'react';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="skeleton" className={cn('animate-shimmer rounded-md', className)} {...props} />
  );
}

export { Skeleton };
