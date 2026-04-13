import type { Metadata } from 'next';
import Link from 'next/link';
import { Home } from 'lucide-react';
import GoBackButton from './GoBackButton';

export const metadata: Metadata = {
  title: 'Страница не найдена',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{ background: 'var(--gradient-auth)' }}
    >
      <div className="pointer-events-none absolute -top-48 -left-48 h-96 w-96 animate-float rounded-full bg-(--primary) opacity-20 blur-3xl" />
      <div
        className="pointer-events-none absolute -right-40 -bottom-40 h-80 w-80 animate-float rounded-full bg-(--danger) opacity-20 blur-3xl"
        style={{ animationDelay: '1.5s' }}
      />
      <div
        className="pointer-events-none absolute top-1/3 -right-32 h-64 w-64 animate-float rounded-full bg-(--violet-text) opacity-20 blur-3xl"
        style={{ animationDelay: '3s' }}
      />

      <div className="animate-fade-in relative z-10 flex max-w-md flex-col items-center text-center">
        <div className="mb-6 flex items-baseline gap-1">
          <span className="text-8xl font-extrabold tracking-tight text-(--primary)">4</span>
          <span className="relative flex h-20 w-20 items-center justify-center">
            <span className="absolute inset-0 animate-spin-slow rounded-full border-4 border-dashed border-(--primary-border) opacity-40" />
            <span className="text-8xl font-extrabold tracking-tight text-(--primary)">0</span>
          </span>
          <span className="text-8xl font-extrabold tracking-tight text-(--primary)">4</span>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-(--fg)">Страница не найдена</h1>
        <p className="mb-8 text-sm leading-relaxed text-(--fg-muted)">
          Запрашиваемая страница не существует или была перемещена.
          <br />
          Проверьте адрес или вернитесь на главную.
        </p>

        <div className="flex gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-(--primary) px-5 py-2.5 text-sm font-medium text-(--primary-fg) shadow-sm transition-all hover:bg-(--primary-hover) hover:shadow-md"
          >
            <Home size={15} strokeWidth={2} />
            На главную
          </Link>
          <GoBackButton />
        </div>
      </div>
    </div>
  );
}
