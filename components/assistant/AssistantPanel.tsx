'use client';

import { useEffect, useRef, useState } from 'react';
import { History, Plus, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { useAssistantChat } from '@/lib/hooks/use-assistant-chat';
import { AssistantHistory } from './AssistantHistory';
import { AssistantInput } from './AssistantInput';
import { AssistantMessage } from './AssistantMessage';

const SUGGESTED = [
  { text: 'найди препарат аспирин', emoji: '💊' },
  { text: 'врач Иванов', emoji: '👨‍⚕️' },
  { text: 'клиника на Ленина', emoji: '🏥' },
  { text: 'запланируй визит к Иванову завтра в 10:00', emoji: '📅' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  chat: ReturnType<typeof useAssistantChat>;
}

export function AssistantPanel({ open, onClose, chat }: Props) {
  const [draft, setDraft] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  useEffect(() => {
    if (open) chat.refreshConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || !stickToBottomRef.current) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [chat.messages, open]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distance < 80;
  };

  const submit = () => {
    if (!draft.trim()) return;
    const text = draft;
    setDraft('');
    stickToBottomRef.current = true;
    chat.send(text);
  };

  const sendSuggestion = (text: string) => {
    stickToBottomRef.current = true;
    chat.send(text);
  };

  const onSelectConv = (id: number) => {
    chat.openConversation(id);
    setHistoryOpen(false);
    stickToBottomRef.current = true;
  };

  const onNewChat = () => {
    chat.newChat();
    setHistoryOpen(false);
    setDraft('');
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-[60] flex bg-black/40 backdrop-blur-sm md:inset-auto md:right-5 md:bottom-22 md:bg-transparent md:backdrop-blur-none',
        !open && 'pointer-events-none hidden',
      )}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'animate-assistant-pop relative flex w-full flex-col overflow-hidden',
          'bg-card text-card-foreground border-border border shadow-2xl',
          'md:h-[680px] md:max-h-[85vh] md:w-[720px] md:rounded-2xl',
          'md:shadow-[0_24px_60px_-20px_color-mix(in_oklab,var(--primary)_25%,transparent),0_8px_32px_-8px_rgba(0,0,0,0.18)]',
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,transparent_0%,var(--primary)_25%,color-mix(in_oklab,var(--primary)_60%,white)_50%,var(--primary)_75%,transparent_100%)] opacity-80"
        />

        <header className="border-border bg-[linear-gradient(180deg,color-mix(in_oklab,var(--primary)_8%,var(--card))_0%,var(--card)_100%)] relative flex items-center gap-2 border-b px-3 py-2.5">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'size-8 transition-colors',
              historyOpen && 'bg-accent text-accent-foreground',
            )}
            onClick={() => setHistoryOpen((v) => !v)}
            aria-label="История бесед"
          >
            <History className="size-4" />
          </Button>

          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span className="bg-primary/15 text-primary ring-primary/20 relative flex size-8 shrink-0 items-center justify-center rounded-full ring-1">
              <Sparkles className="size-4" />
              {chat.isStreaming && (
                <span className="bg-success ring-card absolute -right-0.5 -bottom-0.5 size-2 rounded-full ring-2" />
              )}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-semibold tracking-tight">AI-ассистент</span>
                <span className="text-primary text-[10px] font-medium uppercase tracking-wider">
                  beta
                </span>
              </div>
              <div className="text-muted-foreground truncate text-[11px]">
                {chat.isStreaming
                  ? 'Печатает ответ…'
                  : 'Препараты · Врачи · Организации · Визиты'}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={onNewChat}
            aria-label="Новый чат"
            title="Новый чат"
          >
            <Plus className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <X className="size-4" />
          </Button>
        </header>

        <div className="flex min-h-0 flex-1">
          {historyOpen && (
            <AssistantHistory
              conversations={chat.conversations}
              activeId={chat.conversationId}
              isLoading={chat.isLoadingHistory}
              onSelect={onSelectConv}
              onDelete={chat.removeConversation}
              onNewChat={onNewChat}
            />
          )}

          <div className="flex min-w-0 flex-1 flex-col">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="bg-[linear-gradient(180deg,color-mix(in_oklab,var(--primary)_3%,var(--card))_0%,var(--card)_15%)] flex-1 space-y-4 overflow-y-auto px-3.5 py-4"
            >
              {chat.isLoadingConversation && (
                <div className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-xs">
                  <span className="border-muted-foreground/30 border-t-primary inline-block size-3 animate-spin rounded-full border-2" />
                  Загрузка беседы…
                </div>
              )}

              {!chat.isLoadingConversation && chat.messages.length === 0 && (
                <EmptyState onPick={sendSuggestion} />
              )}

              {chat.messages.map((m) => (
                <AssistantMessage
                  key={m.id}
                  message={m}
                  onNavigate={onClose}
                  onConfirmAction={chat.confirmAction}
                  onDismissAction={chat.dismissAction}
                />
              ))}
            </div>

            <div className="border-border bg-card/95 supports-[backdrop-filter]:bg-card/70 border-t px-3 py-2.5 backdrop-blur">
              <AssistantInput
                value={draft}
                onChange={setDraft}
                onSubmit={submit}
                onStop={chat.stop}
                disabled={chat.isStreaming || chat.isLoadingConversation}
                isStreaming={chat.isStreaming}
              />
              <div className="text-muted-foreground/70 mt-1.5 px-1 text-[10px]">
                Enter — отправить · Shift+Enter — перенос строки
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="animate-fade-in flex h-full flex-col items-center justify-center gap-5 px-6 py-10 text-center">
      <div className="relative">
        <span className="bg-primary/20 absolute inset-0 -z-10 animate-pulse rounded-full blur-xl" />
        <div className="bg-[radial-gradient(circle_at_30%_25%,color-mix(in_oklab,var(--primary)_85%,white)_0%,var(--primary)_60%,color-mix(in_oklab,var(--primary)_70%,black)_100%)] text-primary-foreground animate-float flex size-16 items-center justify-center rounded-2xl shadow-lg">
          <Sparkles className="size-7 drop-shadow" />
        </div>
      </div>

      <div className="space-y-1">
        <h2 className="text-foreground text-base font-semibold tracking-tight">Чем помочь?</h2>
        <p className="text-muted-foreground mx-auto max-w-[280px] text-xs leading-relaxed">
          Я помогу найти препарат, врача или организацию, а ещё могу запланировать визит — просто
          опишите, что нужно
        </p>
      </div>

      <div className="grid w-full max-w-md grid-cols-1 gap-1.5 sm:grid-cols-2">
        {SUGGESTED.map((s) => (
          <button
            key={s.text}
            type="button"
            onClick={() => onPick(s.text)}
            className={cn(
              'group border-border bg-card hover:border-primary/40 hover:bg-primary/5',
              'flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs transition-all',
              'hover:-translate-y-0.5 hover:shadow-sm',
            )}
          >
            <span className="text-base leading-none">{s.emoji}</span>
            <span className="text-foreground/80 group-hover:text-foreground line-clamp-2 flex-1 transition-colors">
              {s.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
