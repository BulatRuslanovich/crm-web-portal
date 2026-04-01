'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Shared UI primitives — colours via CSS variables (dark/light aware)

/* ── Status Badge ──────────────────────────────────────────────────────────── */
export function StatusBadge({ name }: { name: string }) {
  const n = name.toLowerCase();
  let cls = 'bg-(--neutral-subtle) text-(--neutral-text) border-(--neutral-border)';
  if (n === 'запланирован') cls = 'bg-(--primary-subtle) text-(--primary-text) border-(--primary-border)';
  else if (n === 'открыт')  cls = 'bg-(--warn-subtle) text-(--warn-text) border-(--warn-border)';
  else if (n === 'сохранен') cls = 'bg-(--violet-subtle) text-(--violet-text) border-(--violet-border)';
  else if (n === 'закрыт')  cls = 'bg-(--success-subtle) text-(--success-text) border-(--success-border)';
  return (
    <span className={`inline-flex text-xs px-2.5 py-0.5 rounded-full font-medium border ${cls}`}>
      {name}
    </span>
  );
}

/* ── Page Header ───────────────────────────────────────────────────────────── */
export function PageHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold text-(--fg)">{title}</h2>
      {action}
    </div>
  );
}

/* ── Field (read-only label + value) ───────────────────────────────────────── */
export function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold text-(--fg-muted) uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-(--fg)">{value || '—'}</p>
    </div>
  );
}

/* ── Card ──────────────────────────────────────────────────────────────────── */
export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-(--surface) border border-(--border) rounded-xl ${className}`}
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-4 border-b border-(--border)">
      {children}
    </div>
  );
}

export function CardFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-4 bg-(--surface-raised) border-t border-(--border) rounded-b-xl flex justify-end gap-2">
      {children}
    </div>
  );
}

/* ── Form Controls ─────────────────────────────────────────────────────────── */
export function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full h-9 px-3 bg-(--input-bg) border border-(--border) rounded-xl text-sm text-(--fg) placeholder:text-(--fg-subtle) focus:outline-none focus:ring-2 focus:ring-(--ring) focus:border-(--ring) transition-colors disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full px-3 py-2 bg-(--input-bg) border border-(--border) rounded-xl text-sm text-(--fg) placeholder:text-(--fg-subtle) resize-none focus:outline-none focus:ring-2 focus:ring-(--ring) focus:border-(--ring) transition-colors ${className}`}
      {...props}
    />
  );
}

export function Select({ className = '', children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full h-9 px-3 bg-(--input-bg) border border-(--border) rounded-xl text-sm text-(--fg) focus:outline-none focus:ring-2 focus:ring-(--ring) focus:border-(--ring) transition-colors disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({ required, children }: { required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-(--fg) mb-1.5">
      {children}
      {required && <span className="text-(--danger) ml-0.5">*</span>}
    </label>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2.5 bg-(--danger-subtle) border border-(--danger-border) rounded-xl text-sm text-(--danger-text) animate-fade-in">
      <span className="shrink-0 mt-px">!</span>
      {message}
    </div>
  );
}

export function SuccessBox({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2.5 bg-(--success-subtle) border border-(--success-border) rounded-xl text-sm text-(--success-text) animate-fade-in">
      {message}
    </div>
  );
}

/* ── Buttons ───────────────────────────────────────────────────────────────── */
const btnBase = 'inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl disabled:opacity-50 transition-all active:scale-[0.97] cursor-pointer disabled:cursor-default';

export function BtnPrimary({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${btnBase} text-(--primary-fg) bg-(--primary) hover:bg-(--primary-hover) shadow-sm ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function BtnSuccess({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${btnBase} text-(--success-fg) bg-(--success) hover:bg-(--success-hover) shadow-sm ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function BtnSecondary({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${btnBase} text-(--fg) bg-(--surface) border border-(--border) hover:bg-(--surface-raised) ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function BtnDanger({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${btnBase} text-(--danger-text) bg-(--surface) border border-(--border) hover:bg-(--danger-subtle) hover:border-(--danger-border) ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/* ── Link Button (for nav actions like "Добавить") ─────────────────────────── */
export function LinkButton({
  href, variant = 'success', children,
}: {
  href: string; variant?: 'primary' | 'success'; children: React.ReactNode;
}) {
  const colors = variant === 'success'
    ? 'text-(--success-fg) bg-(--success) hover:bg-(--success-hover)'
    : 'text-(--primary-fg) bg-(--primary) hover:bg-(--primary-hover)';
  return (
    <Link
      href={href}
      className={`${btnBase} ${colors} shadow-sm`}
    >
      {children}
    </Link>
  );
}

/* ── Back Button ───────────────────────────────────────────────────────────── */
export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`${btnBase} text-(--fg-muted) hover:text-(--fg) bg-(--surface) hover:bg-(--surface-raised) border border-(--border)`}
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <ArrowLeft size={14} strokeWidth={2} />
      Назад
    </button>
  );
}

/* ── Skeleton ──────────────────────────────────────────────────────────────── */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-(--surface-raised) rounded-xl animate-skeleton ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-(--surface) border border-(--border) rounded-xl p-5 space-y-3" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="bg-(--surface) border border-(--border) rounded-xl divide-y divide-(--border)" style={{ boxShadow: 'var(--shadow-sm)' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-1/3" />
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
    <div className="bg-(--surface) border border-(--border) rounded-xl px-4 py-16 text-center animate-fade-in" style={{ boxShadow: 'var(--shadow-sm)' }}>
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
    <div className="flex items-center justify-center gap-2 mt-5">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className={`${btnBase} bg-(--surface) text-(--fg) border border-(--border) hover:bg-(--surface-raised) disabled:opacity-40`}
      >
        &larr; Назад
      </button>
      <span className="text-sm text-(--fg-muted) px-2 tabular-nums">
        {page} из {totalPages}
      </span>
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className={`${btnBase} bg-(--surface) text-(--fg) border border-(--border) hover:bg-(--surface-raised) disabled:opacity-40`}
      >
        Далее &rarr;
      </button>
    </div>
  );
}
