'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GoBackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-(--border) bg-(--surface) px-5 py-2.5 text-sm font-medium text-(--fg-muted) shadow-sm transition-all hover:bg-(--surface-raised) hover:text-(--fg)"
    >
      <ArrowLeft size={15} strokeWidth={2} />
      Назад
    </button>
  );
}
