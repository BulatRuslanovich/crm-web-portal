'use client';

import { useMemo, useState } from 'react';
import { MessageSquare, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { AssistantConversation } from '@/lib/api/assistant';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate()
  ) {
    return 'Вчера';
  }
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
}

interface Props {
  conversations: AssistantConversation[];
  activeId: number | null;
  isLoading: boolean;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onNewChat: () => void;
}

export function AssistantHistory({
  conversations,
  activeId,
  isLoading,
  onSelect,
  onDelete,
  onNewChat,
}: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => (c.title ?? '').toLowerCase().includes(q));
  }, [conversations, query]);

  return (
    <aside className="border-border bg-[linear-gradient(180deg,color-mix(in_oklab,var(--primary)_4%,var(--card))_0%,var(--card)_100%)] flex h-full w-64 shrink-0 flex-col border-r">
      <div className="border-border space-y-2 border-b p-2.5">
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 w-full justify-start gap-2 shadow-sm"
          onClick={onNewChat}
        >
          <Plus className="size-4" />
          Новый чат
        </Button>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск в истории"
            className="bg-background h-8 rounded-lg pl-8 text-xs"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5">
        {isLoading && conversations.length === 0 && (
          <div className="text-muted-foreground flex items-center justify-center gap-1.5 p-3 text-xs">
            <span className="border-muted-foreground/30 border-t-primary inline-block size-3 animate-spin rounded-full border-2" />
            Загрузка…
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="text-muted-foreground p-4 text-center text-xs">
            {query ? (
              <>
                Ничего не найдено по
                <br />
                <span className="text-foreground font-medium">«{query}»</span>
              </>
            ) : (
              <>
                <MessageSquare className="text-muted-foreground/40 mx-auto mb-2 size-8" />
                Беседы появятся здесь
              </>
            )}
          </div>
        )}
        <ul className="space-y-0.5">
          {filtered.map((c) => {
            const isActive = c.conversationId === activeId;
            const title = c.title?.trim() || `Беседа #${c.conversationId}`;
            return (
              <li key={c.conversationId}>
                <div
                  className={cn(
                    'group relative flex items-start gap-2 rounded-lg px-2 py-1.5 text-xs transition-all',
                    isActive
                      ? 'bg-primary/10 text-foreground'
                      : 'hover:bg-accent/60 text-foreground/80',
                  )}
                >
                  {isActive && (
                    <span className="bg-primary absolute top-2 bottom-2 left-0 w-0.5 rounded-r-full" />
                  )}
                  <button
                    type="button"
                    onClick={() => onSelect(c.conversationId)}
                    className="flex min-w-0 flex-1 cursor-pointer items-start gap-2 text-left"
                  >
                    <MessageSquare
                      className={cn(
                        'mt-0.5 size-3.5 shrink-0',
                        isActive ? 'text-primary' : 'text-muted-foreground',
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{title}</div>
                      <div className="text-muted-foreground truncate text-[10px]">
                        {formatDate(c.updatedAt)}
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(c.conversationId);
                    }}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded p-1 opacity-0 transition-all group-hover:opacity-100 focus:opacity-100"
                    aria-label="Удалить беседу"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
