'use client';

import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { AlertCircle, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/lib/hooks/use-assistant-chat';
import { AssistantActionCard } from './AssistantActionCard';
import { AssistantToolCard } from './AssistantToolCard';

interface Props {
  message: ChatMessage;
  onNavigate?: () => void;
  onConfirmAction?: (messageId: string, actionId: string) => void;
  onDismissAction?: (messageId: string, actionId: string) => void;
}

export function AssistantMessage({ message, onNavigate, onConfirmAction, onDismissAction }: Props) {
  const isUser = message.role === 'user';
  const isStreaming = message.status === 'streaming' || message.status === 'tool_running';

  return (
    <div
      className={cn(
        'animate-fade-in flex w-full gap-2.5',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      <div
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold',
          isUser
            ? 'bg-muted text-muted-foreground ring-border ring-1'
            : 'bg-card text-muted-foreground ring-border ring-1',
        )}
      >
        {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
      </div>

      <div
        className={cn('flex max-w-[85%] min-w-0 flex-col', isUser ? 'items-end' : 'items-start')}
      >
        {(message.content || message.tools.length > 0 || (isStreaming && !message.content)) && (
          <div
            className={cn(
              'rounded-xl px-3.5 py-2 text-sm transition-shadow',
              isUser
                ? 'bg-primary text-primary-foreground rounded-tr-sm'
                : 'bg-card text-foreground border-border rounded-tl-sm border',
            )}
          >
            {message.tools.length > 0 && (
              <div className="space-y-1">
                {message.tools.map((tool, idx) => (
                  <AssistantToolCard key={idx} tool={tool} onNavigate={onNavigate} />
                ))}
              </div>
            )}

            {message.content && (
              <div
                className={cn(
                  'prose prose-sm max-w-none break-words',
                  isUser ? 'prose-invert' : 'dark:prose-invert',
                  '[&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
                  '[&_li]:my-0 [&_ol]:my-1.5 [&_ul]:my-1.5',
                  '[&_a]:underline [&_a]:underline-offset-2',
                  '[&_code]:rounded [&_code]:bg-black/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] dark:[&_code]:bg-white/10',
                  '[&_pre]:bg-background/60 [&_pre]:border-border [&_pre]:my-2 [&_pre]:rounded-lg [&_pre]:border [&_pre]:p-2.5',
                  '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
                  isUser && '[&_a]:text-primary-foreground [&_code]:bg-black/25',
                )}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                    {message.content}
                  </ReactMarkdown>
                )}
                {isStreaming && (
                  <span className="bg-foreground/70 ml-0.5 inline-block h-3.5 w-[3px] animate-pulse rounded-sm align-middle" />
                )}
              </div>
            )}

            {!message.content && isStreaming && message.tools.length === 0 && (
              <div className="text-muted-foreground flex items-center gap-1 py-0.5">
                <span className="bg-muted-foreground/60 assistant-typing-dot inline-block size-1.5 rounded-full" />
                <span
                  className="bg-muted-foreground/60 assistant-typing-dot inline-block size-1.5 rounded-full"
                  style={{ animationDelay: '180ms' }}
                />
                <span
                  className="bg-muted-foreground/60 assistant-typing-dot inline-block size-1.5 rounded-full"
                  style={{ animationDelay: '360ms' }}
                />
              </div>
            )}

            {message.status === 'error' && message.error && (
              <div className="text-destructive border-destructive/20 mt-2 flex items-start gap-1.5 border-t pt-2 text-xs">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                <span>{message.error}</span>
              </div>
            )}
          </div>
        )}

        {message.actions.length > 0 && (
          <div className="mt-1.5 w-full space-y-1.5">
            {message.actions.map((action) => (
              <AssistantActionCard
                key={action.actionId}
                action={action}
                onConfirm={() => onConfirmAction?.(message.id, action.actionId)}
                onDismiss={() => onDismissAction?.(message.id, action.actionId)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
