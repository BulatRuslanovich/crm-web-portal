'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const BUILD_VERSION = '0.1.0'

type LineKind = 'prompt' | 'output' | 'comment' | 'error' | 'blank' | 'highlight';

interface Line {
  kind: LineKind;
  text: string;
  delay?: number;
}

const SESSION: Line[] = [
  { kind: 'blank', text: '' },
  { kind: 'prompt', text: 'fortune' },
  { kind: 'output', text: '  «Барсик хочет секса»' },
  { kind: 'output', text: '  —  Барсик Ренатович' },
  { kind: 'blank', text: '' },
];

const DELAY_BY_KIND: Record<LineKind, number> = {
  prompt: 120,
  output: 60,
  comment: 90,
  error: 80,
  blank: 40,
  highlight: 80,
};

const COLOR: Record<LineKind, string> = {
  prompt: 'text-[#28c840]',
  output: 'text-white/75',
  comment: 'text-white/35',
  error: 'text-[#ff5f57]',
  blank: '',
  highlight: 'text-[#ffbd2e] font-bold',
};

export default function PharmoPage() {
  const [visible, setVisible] = useState(0);
  const done = visible >= SESSION.length;

  useEffect(() => {
    if (done) return;
    const delay = visible === 0 ? 400 : (DELAY_BY_KIND[SESSION[visible - 1].kind] ?? 80);
    const t = setTimeout(() => setVisible((n) => n + 1), delay);
    return () => clearTimeout(t);
  }, [visible, done]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 py-4">
      <Link
        href="/dashboard"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft size={14} /> Назад
      </Link>

      <div className="border-border overflow-hidden rounded-2xl border bg-[#0d0d0d] shadow-xl dark:bg-[#0a0a0a]">
        <div className="flex items-center gap-2 border-b border-white/5 bg-white/5 px-4 py-2.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#ffbd2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
          <span className="mx-auto font-mono text-[11px] text-white/30">
            pharmo@credits — bash — 80×24
          </span>
        </div>

        <div className="min-h-72 p-5 font-mono text-sm leading-6">
          {SESSION.slice(0, visible).map((line, i) => (
            <div key={i} className={COLOR[line.kind]}>
              {line.kind === 'prompt' ? (
                <span>
                  <span className="text-[#ff9500]/70 select-none">~/pharmo </span>
                  <span className="text-[#28c840]/80 select-none">$ </span>
                  <span className="text-white/90">{line.text}</span>
                </span>
              ) : line.text ? (
                line.text
              ) : (
                <span>&nbsp;</span>
              )}
            </div>
          ))}

          <span className="mt-0.5 inline-flex items-center gap-1">
            {done && (
              <>
                <span className="font-mono text-sm text-[#ff9500]/70 select-none">~/pharmo </span>
                <span className="font-mono text-sm text-[#28c840]/80 select-none">$ </span>
              </>
            )}
            <span className="inline-block h-4 w-2 animate-pulse bg-white/60" />
          </span>
        </div>
      </div>

      <p className="text-muted-foreground/30 text-center font-mono text-[11px]">
        /pharmo · не для навигации · v{BUILD_VERSION}
      </p>
    </div>
  );
}
