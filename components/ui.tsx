'use client'

import React, { forwardRef } from 'react';
import { ArrowLeft, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input as ShadInput } from '@/components/ui/input';
import { Skeleton as ShadSkeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function StatusBadge({ name }: { name: string }) {
  const n = name.toLowerCase();
  const variant: React.ComponentProps<typeof Badge>['variant'] =
    n === 'запланирован'
      ? 'default'
      : n === 'открыт'
        ? 'warning'
        : n === 'сохранен'
          ? 'secondary'
          : n === 'закрыт'
            ? 'success'
            : 'outline';
  const dotColor =
    n === 'запланирован'
      ? 'bg-primary-foreground'
      : n === 'открыт'
        ? 'bg-warning-foreground'
        : n === 'сохранен'
          ? 'bg-muted-foreground'
          : n === 'закрыт'
            ? 'bg-success-foreground'
            : 'bg-muted-foreground';
  return (
    <Badge variant={variant} className="rounded-full">
      <span className={cn('mr-1 size-1.5 rounded-full', dotColor)} />
      {name}
    </Badge>
  );
}

export function Field({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: string | null;
  icon?: React.ElementType;
}) {
  return (
    <div className="group">
      <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {Icon && <Icon size={12} strokeWidth={2} className="text-muted-foreground/70" />}
        {label}
      </p>
      <p className="text-sm leading-relaxed text-foreground">
        {value || <span className="text-muted-foreground/70">--</span>}
      </p>
    </div>
  );
}

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md',
        className,
      )}
    >
      {children}
    </div>
  );
}


export function CardFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end gap-2 rounded-b-xl border-t bg-muted/40 px-5 py-4">
      {children}
    </div>
  );
}

export function SectionLabel({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      {Icon && (
        <div className="flex size-6 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <Icon size={12} strokeWidth={2} />
        </div>
      )}
      <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
        {children}
      </p>
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <ShadInput ref={ref} className={cn('h-10', className)} {...props} />
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = '', ...props }) => (
  <textarea
    data-slot="textarea"
    className={cn(
      'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export function Label({ required, children }: { required?: boolean; children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-foreground">
      {children}
      {required && <span className="ml-0.5 text-destructive">*</span>}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-destructive">{message}</p>;
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="animate-fade-in whitespace-pre-line">
      <AlertCircle />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export function SuccessBox({ message }: { message: string }) {
  return (
    <Alert variant="success" className="animate-fade-in">
      <CheckCircle2 />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function BtnPrimary({ children, className = '', ...props }: BtnProps) {
  return (
    <Button className={cn('h-10 px-4', className)} {...props}>
      {children}
    </Button>
  );
}

export function BtnSuccess({ children, className = '', ...props }: BtnProps) {
  return (
    <Button variant="success" className={cn('h-10 px-4', className)} {...props}>
      {children}
    </Button>
  );
}

export function BtnSecondary({ children, className = '', ...props }: BtnProps) {
  return (
    <Button variant="outline" className={cn('h-10 px-4', className)} {...props}>
      {children}
    </Button>
  );
}

export function BtnDanger({ children, className = '', ...props }: BtnProps) {
  return (
    <Button
      variant="outline"
      className={cn(
        'h-10 px-4 text-destructive hover:bg-destructive/10 hover:text-destructive',
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

export function LinkButton({
  href,
  variant = 'success',
  children,
}: {
  href: string;
  variant?: 'primary' | 'success';
  children: React.ReactNode;
}) {
  return (
    <Button asChild variant={variant === 'success' ? 'success' : 'default'} className="h-10 px-4">
      <Link href={href}>{children}</Link>
    </Button>
  );
}

export function BackButton({ href, onClick }: { href?: string; onClick?: () => void }) {
  const router = useRouter();
  const content = (
    <>
      <ArrowLeft />
      Назад
    </>
  );
  if (href) {
    return (
      <Button asChild variant="outline" className="h-10 px-4">
        <Link href={href}>{content}</Link>
      </Button>
    );
  }
  return (
    <Button
      variant="outline"
      className="h-10 px-4"
      onClick={onClick ?? (() => router.back())}
    >
      {content}
    </Button>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <ShadSkeleton className={cn('rounded-md', className)} />;
}

export function CardSkeleton() {
  return (
    <div className="animate-fade-in space-y-3 rounded-xl border bg-card p-5 shadow-sm">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-3/5" />
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="animate-fade-in divide-y rounded-xl border bg-card shadow-sm">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="flex flex-1 items-center gap-3">
            <Skeleton className="size-9 shrink-0 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div className="animate-fade-in rounded-xl border bg-card px-4 py-20 text-center shadow-sm">
      <p className="text-sm text-muted-foreground">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-5 flex items-center justify-center gap-1.5">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft />
      </Button>
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
        let p: number;
        if (totalPages <= 7) {
          p = i + 1;
        } else if (page <= 4) {
          p = i + 1;
        } else if (page >= totalPages - 3) {
          p = totalPages - 6 + i;
        } else {
          p = page - 3 + i;
        }
        return (
          <Button
            key={p}
            variant={p === page ? 'default' : 'outline'}
            size="icon"
            onClick={() => onPage(p)}
          >
            {p}
          </Button>
        );
      })}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
