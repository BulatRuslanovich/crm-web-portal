import type { Metadata } from 'next';
import Link from 'next/link';
import { Home } from 'lucide-react';

import { BackButton } from '@/components/ui';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Страница не найдена',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="animate-fade-in relative z-10 flex max-w-md flex-col items-center text-center">
        <div className="mb-6 flex items-baseline gap-1">
          <span className="text-foreground text-8xl font-extrabold tracking-tight">4</span>
          <span className="relative flex h-20 w-20 items-center justify-center">
            <span className="animate-spin-slow border-border absolute inset-0 rounded-full border-4 border-dashed opacity-60" />
            <span className="text-foreground text-8xl font-extrabold tracking-tight">0</span>
          </span>
          <span className="text-foreground text-8xl font-extrabold tracking-tight">4</span>
        </div>

        <h1 className="text-foreground mb-2 text-2xl font-bold">Страница не найдена</h1>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          Запрашиваемая страница не существует или была перемещена.
          <br />
          Проверьте адрес или вернитесь на главную.
        </p>

        <div className="flex gap-3">
          <Button asChild>
            <Link href="/">
              <Home />
              На главную
            </Link>
          </Button>
          <BackButton />
        </div>
      </div>
    </div>
  );
}
