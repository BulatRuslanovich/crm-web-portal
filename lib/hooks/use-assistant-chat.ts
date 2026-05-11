'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  assistantApi,
  streamChat,
  type AssistantConversation,
  type AssistantMessage,
  type ChatEvent,
} from '@/lib/api/assistant';
import { extractApiError } from '@/lib/api/errors';
import type { ActivResponse } from '@/lib/api/types';

export interface ToolCall {
  name: string;
  argumentsJson: string;
  resultJson?: string;
  isError?: boolean;
  status: 'running' | 'done' | 'error';
}

export type ActionStatus =
  | 'awaiting_confirmation'
  | 'executing_action'
  | 'action_done'
  | 'action_failed'
  | 'dismissed';

export interface ProposedAction {
  actionId: string;
  tool: string;
  summary: string;
  expiresAt: number;
  status: ActionStatus;
  error?: string;
  result?: ActivResponse;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status: 'streaming' | 'tool_running' | 'awaiting_confirmation' | 'done' | 'error';
  error?: string;
  tools: ToolCall[];
  actions: ProposedAction[];
  createdAt: string;
}

function genId() {
  return Math.random().toString(36).slice(2);
}

function fromHistory(msg: AssistantMessage): ChatMessage {
  return {
    id: `srv-${msg.messageId}`,
    role: msg.role,
    content: msg.content,
    status: 'done',
    tools: [],
    actions: [],
    createdAt: msg.createdAt,
  };
}

export function useAssistantChat() {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversations, setConversations] = useState<AssistantConversation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const refreshConversations = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const { data } = await assistantApi.listConversations();
      setConversations(data);
    } catch {
      // silent — sidebar просто пустой
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const newChat = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setConversationId(null);
    setMessages([]);
    setIsStreaming(false);
  }, []);

  const openConversation = useCallback(async (id: number) => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoadingConversation(true);
    setIsStreaming(false);
    try {
      const { data } = await assistantApi.getConversation(id);
      setConversationId(data.conversationId);
      setMessages(data.messages.map(fromHistory));
    } catch {
      toast.error('Не удалось загрузить беседу');
    } finally {
      setIsLoadingConversation(false);
    }
  }, []);

  const removeConversation = useCallback(
    async (id: number) => {
      try {
        await assistantApi.deleteConversation(id);
        setConversations((prev) => prev.filter((c) => c.conversationId !== id));
        if (conversationId === id) newChat();
      } catch {
        toast.error('Не удалось удалить беседу');
      }
    },
    [conversationId, newChat],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const updateAction = useCallback(
    (messageId: string, actionId: string, patch: (a: ProposedAction) => ProposedAction) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, actions: m.actions.map((a) => (a.actionId === actionId ? patch(a) : a)) }
            : m,
        ),
      );
    },
    [],
  );

  const confirmAction = useCallback(
    async (messageId: string, actionId: string) => {
      updateAction(messageId, actionId, (a) => ({ ...a, status: 'executing_action', error: undefined }));
      try {
        const { data } = await assistantApi.confirmAction(actionId);
        updateAction(messageId, actionId, (a) => ({ ...a, status: 'action_done', result: data }));
        toast.success(`Визит #${data.activId} создан`);
      } catch (err) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        const message =
          status === 404
            ? 'Черновик истёк, попробуйте снова'
            : extractApiError(err, 'Не удалось подтвердить действие');
        updateAction(messageId, actionId, (a) => ({
          ...a,
          status: 'action_failed',
          error: message,
        }));
        toast.error(message);
      }
    },
    [updateAction],
  );

  const dismissAction = useCallback(
    (messageId: string, actionId: string) => {
      updateAction(messageId, actionId, (a) => ({ ...a, status: 'dismissed' }));
    },
    [updateAction],
  );

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const userMsg: ChatMessage = {
        id: genId(),
        role: 'user',
        content: trimmed,
        status: 'done',
        tools: [],
        actions: [],
        createdAt: new Date().toISOString(),
      };
      const assistantMsgId = genId();
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        status: 'streaming',
        tools: [],
        actions: [],
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      const updateAssistant = (patch: (m: ChatMessage) => ChatMessage) => {
        setMessages((prev) => prev.map((m) => (m.id === assistantMsgId ? patch(m) : m)));
      };

      let createdConvId: number | null = null;
      let hasPendingAction = false;

      try {
        await streamChat({
          body: { conversationId, message: trimmed },
          signal: ctrl.signal,
          onEvent: (event: ChatEvent) => {
            switch (event.type) {
              case 'conversation_started':
                createdConvId = event.data.conversationId;
                setConversationId(event.data.conversationId);
                break;
              case 'tool_call':
                updateAssistant((m) => ({
                  ...m,
                  status: 'tool_running',
                  tools: [
                    ...m.tools,
                    {
                      name: event.data.name,
                      argumentsJson: event.data.argumentsJson,
                      status: 'running',
                    },
                  ],
                }));
                break;
              case 'tool_result':
                updateAssistant((m) => {
                  const tools = [...m.tools];
                  for (let i = tools.length - 1; i >= 0; i--) {
                    if (tools[i].name === event.data.name && tools[i].status === 'running') {
                      tools[i] = {
                        ...tools[i],
                        resultJson: event.data.resultJson,
                        isError: event.data.isError,
                        status: event.data.isError ? 'error' : 'done',
                      };
                      break;
                    }
                  }
                  return { ...m, status: 'streaming', tools };
                });
                break;
              case 'token':
                updateAssistant((m) => ({
                  ...m,
                  status: 'streaming',
                  content: m.content + event.data.text,
                }));
                break;
              case 'action_proposed':
                hasPendingAction = true;
                updateAssistant((m) => ({
                  ...m,
                  actions: [
                    ...m.actions,
                    {
                      actionId: event.data.actionId,
                      tool: event.data.tool,
                      summary: event.data.summary,
                      expiresAt: Date.now() + event.data.expiresInMinutes * 60_000,
                      status: 'awaiting_confirmation',
                    },
                  ],
                }));
                break;
              case 'error':
                updateAssistant((m) => ({
                  ...m,
                  status: 'error',
                  error: event.data.message,
                }));
                toast.error(event.data.message);
                break;
              case 'done':
                updateAssistant((m) => {
                  if (m.status === 'error') return m;
                  return {
                    ...m,
                    status: hasPendingAction ? 'awaiting_confirmation' : 'done',
                  };
                });
                break;
            }
          },
        });
        updateAssistant((m) => {
          if (m.status === 'streaming' || m.status === 'tool_running') {
            return { ...m, status: hasPendingAction ? 'awaiting_confirmation' : 'done' };
          }
          return m;
        });
      } catch (err) {
        const aborted = (err as Error)?.name === 'AbortError' || ctrl.signal.aborted;
        if (aborted) {
          updateAssistant((m) => ({ ...m, status: 'done' }));
        } else {
          const message = err instanceof Error ? err.message : 'Ошибка соединения';
          updateAssistant((m) => ({ ...m, status: 'error', error: message }));
          toast.error(message);
        }
      } finally {
        if (abortRef.current === ctrl) abortRef.current = null;
        setIsStreaming(false);
        if (createdConvId !== null || conversationId !== null) {
          refreshConversations();
        }
      }
    },
    [conversationId, isStreaming, refreshConversations],
  );

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return {
    conversationId,
    messages,
    isStreaming,
    conversations,
    isLoadingHistory,
    isLoadingConversation,
    send,
    stop,
    newChat,
    openConversation,
    removeConversation,
    refreshConversations,
    confirmAction,
    dismissAction,
  };
}
