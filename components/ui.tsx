'use client';

import { forwardRef } from 'react';
import { ArrowLeft, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/* ── Status Badge ──────────────────────────────────────────────────────────── */
export function StatusBadge({ name }: { name: string }) {
  const n = name.toLowerCase();
  let cls = 'bg-(--neutral-subtle) text-(--neutral-text) border-(--neutral-border)';
  if (n === 'запланирован')
    cls = 'bg-(--primary-subtle) text-(--primary-text) border-(--primary-border)';
  else if (n === 'открыт') cls = 'bg-(--warn-subtle) text-(--warn-text) border-(--warn-border)';
  else if (n === 'сохранен')
    cls = 'bg-(--violet-subtle) text-(--violet-text) border-(--violet-border)';
  else if (n === 'закрыт')
    cls = 'bg-(--success-subtle) text-(--success-text) border-(--success-border)';
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm ${cls}`}
    >
      <span
        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
          n === 'запланирован'
            ? 'bg-(--primary)'
            : n === 'открыт'
              ? 'bg-(--warn)'
              : n === 'сохранен'
                ? 'bg-(--violet-text)'
                : n === 'закрыт'
                  ? 'bg-(--success)'
                  : 'bg-(--fg-subtle)'
        }`}
      />
      {name}
    </span>
  );
}

/* ── Page Header ───────────────────────────────────────────────────────────── */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-(--fg)">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-(--fg-muted)">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ── Field (read-only label + value) ───────────────────────────────────────── */
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
      <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-(--fg-muted) uppercase">
        {Icon && <Icon size={12} strokeWidth={2} className="text-(--fg-subtle)" />}
        {label}
      </p>
      <p className="text-sm leading-relaxed text-(--fg)">
        {value || <span className="text-(--fg-subtle)">--</span>}
      </p>
    </div>
  );
}

/* ── Card ──────────────────────────────────────────────────────────────────── */
export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`hover-glow overflow-hidden rounded-2xl border border-(--border) bg-(--surface) transition-shadow duration-200 ${className}`}
      style={{ boxShadow: 'var(--shadow-sm)', backgroundImage: 'var(--gradient-card)' }}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`border-b border-(--border) px-5 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end gap-2 rounded-b-2xl border-t border-(--border) bg-(--surface-raised)/50 px-5 py-4">
      {children}
    </div>
  );
}

/* ── Section Header (inside detail pages) ─────────────────────────────────── */
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
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-(--primary-subtle)">
          <Icon size={12} strokeWidth={2} className="text-(--primary-text)" />
        </div>
      )}
      <p className="text-xs font-bold tracking-wider text-(--fg-muted) uppercase">{children}</p>
    </div>
  );
}

/* ── Form Controls ─────────────────────────────────────────────────────────── */
export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`h-10 w-full rounded-xl border border-(--border) bg-(--input-bg) px-3.5 text-sm text-(--fg) transition-all duration-200 placeholder:text-(--fg-subtle) focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/40 focus:outline-none disabled:opacity-50 ${className}`}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = '', ...props }, ref) => (
  <textarea
    ref={ref}
    className={`w-full resize-none rounded-xl border border-(--border) bg-(--input-bg) px-3.5 py-2.5 text-sm text-(--fg) transition-all duration-200 placeholder:text-(--fg-subtle) focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/40 focus:outline-none ${className}`}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = '', children, ...props }, ref) => (
    <select
      ref={ref}
      className={`h-10 w-full rounded-xl border border-(--border) bg-(--input-bg) px-3.5 text-sm text-(--fg) transition-all duration-200 focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/40 focus:outline-none disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = 'Select';

export function Label({ required, children }: { required?: boolean; children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-(--fg)">
      {children}
      {required && <span className="ml-0.5 text-(--danger)">*</span>}
    </label>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="animate-fade-in flex items-start gap-2.5 rounded-xl border border-(--danger-border) bg-(--danger-subtle) px-3.5 py-3 text-sm whitespace-pre-line text-(--danger-text)">
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function SuccessBox({ message }: { message: string }) {
  return (
    <div className="animate-fade-in flex items-start gap-2.5 rounded-xl border border-(--success-border) bg-(--success-subtle) px-3.5 py-3 text-sm text-(--success-text)">
      <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/* ── Buttons ───────────────────────────────────────────────────────────────── */
const btnBase =
  'inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-xl disabled:opacity-50 transition-all duration-200 active:scale-[0.97] cursor-pointer disabled:cursor-default';

export function BtnPrimary({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${btnBase} bg-(--primary) text-(--primary-fg) shadow-sm hover:bg-(--primary-hover) hover:shadow-md ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function BtnSuccess({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${btnBase} bg-(--success) text-(--success-fg) shadow-sm hover:bg-(--success-hover) hover:shadow-md ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function BtnSecondary({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${btnBase} border border-(--border) bg-(--surface) text-(--fg) hover:border-(--fg-subtle)/30 hover:bg-(--surface-raised) ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function BtnDanger({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${btnBase} border border-(--border) bg-(--surface) text-(--danger-text) hover:border-(--danger-border) hover:bg-(--danger-subtle) ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/* ── Link Button ─────────────────────────────────────────────────────────── */
export function LinkButton({
  href,
  variant = 'success',
  children,
}: {
  href: string;
  variant?: 'primary' | 'success';
  children: React.ReactNode;
}) {
  const colors =
    variant === 'success'
      ? 'text-(--success-fg) bg-(--success) hover:bg-(--success-hover)'
      : 'text-(--primary-fg) bg-(--primary) hover:bg-(--primary-hover)';
  return (
    <Link href={href} className={`${btnBase} ${colors} shadow-sm hover:shadow-md`}>
      {children}
    </Link>
  );
}

/* ── Back Button ───────────────────────────────────────────────────────────── */
export function BackButton({ href, onClick }: { href?: string; onClick?: () => void }) {
  const router = useRouter();
  const cls = `${btnBase} border border-(--border) bg-(--surface) text-(--fg-muted) hover:bg-(--surface-raised) hover:text-(--fg)`;
  const style = { boxShadow: 'var(--shadow-sm)' };
  const content = (
    <>
      <ArrowLeft size={14} strokeWidth={2} />
      Назад
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls} style={style}>
        {content}
      </Link>
    );
  }
  return (
    <button onClick={onClick ?? (() => router.back())} className={cls} style={style}>
      {content}
    </button>
  );
}

/* ── Skeleton ──────────────────────────────────────────────────────────────── */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-skeleton rounded-xl bg-(--surface-raised) ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div
      className="animate-fade-in space-y-3 rounded-2xl border border-(--border) bg-(--surface) p-5"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-3/5" />
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div
      className="animate-fade-in divide-y divide-(--border) rounded-2xl border border-(--border) bg-(--surface)"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="flex flex-1 items-center gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
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

/* ── Empty State ───────────────────────────────────────────────────────────── */
export function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div
      className="animate-fade-in rounded-2xl border border-(--border) bg-(--surface) px-4 py-20 text-center"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-(--surface-raised)">
        <span className="text-2xl">&#128203;</span>
      </div>
      <p className="text-sm text-(--fg-muted)">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ── Pagination ────────────────────────────────────────────────────────────── */
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
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-(--border) bg-(--surface) text-(--fg) transition-all hover:bg-(--surface-raised) disabled:cursor-default disabled:opacity-30"
      >
        <ChevronLeft size={16} />
      </button>
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
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-sm font-medium transition-all ${
              p === page
                ? 'bg-(--primary) text-(--primary-fg) shadow-sm'
                : 'border border-(--border) bg-(--surface) text-(--fg-muted) hover:bg-(--surface-raised) hover:text-(--fg)'
            }`}
          >
            {p}
          </button>
        );
      })}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-(--border) bg-(--surface) text-(--fg) transition-all hover:bg-(--surface-raised) disabled:cursor-default disabled:opacity-30"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
