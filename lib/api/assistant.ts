'use client';

import { apiClient, BASE_URL, refreshAccessToken } from './browser-client';
import type { ActivResponse } from './types';

export interface AssistantConversation {
  conversationId: number;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AssistantMessageRole = 'user' | 'assistant';

export interface AssistantMessage {
  messageId: number;
  role: AssistantMessageRole;
  content: string;
  createdAt: string;
}

export interface AssistantConversationDetail {
  conversationId: number;
  title: string | null;
  createdAt: string;
  messages: AssistantMessage[];
}

export interface ChatRequest {
  conversationId?: number | null;
  message: string;
}

export interface ActionProposedData {
  actionId: string;
  tool: string;
  summary: string;
  expiresInMinutes: number;
}

export type ChatEvent =
  | { type: 'conversation_started'; data: { conversationId: number } }
  | { type: 'tool_call'; data: { name: string; argumentsJson: string } }
  | { type: 'tool_result'; data: { name: string; resultJson: string; isError: boolean } }
  | { type: 'token'; data: { text: string } }
  | { type: 'action_proposed'; data: ActionProposedData }
  | { type: 'error'; data: { message: string } }
  | { type: 'done'; data: null };

export const assistantApi = {
  listConversations: () =>
    apiClient.get<AssistantConversation[]>('/api/assistant/conversations'),

  getConversation: (id: number) =>
    apiClient.get<AssistantConversationDetail>(`/api/assistant/conversations/${id}`),

  deleteConversation: (id: number) => apiClient.delete(`/api/assistant/conversations/${id}`),

  confirmAction: (actionId: string) =>
    apiClient.post<ActivResponse>(`/api/assistant/confirm/${actionId}`),
};

export interface StreamChatOptions {
  body: ChatRequest;
  signal?: AbortSignal;
  onEvent: (event: ChatEvent) => void;
}

async function doFetch(body: ChatRequest, signal: AbortSignal | undefined, token: string | null) {
  return fetch(`${BASE_URL}/api/assistant/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    credentials: 'include',
    signal,
  });
}

export async function streamChat({ body, signal, onEvent }: StreamChatOptions): Promise<void> {
  let token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  let res = await doFetch(body, signal, token);

  if (res.status === 401) {
    try {
      token = await refreshAccessToken();
      res = await doFetch(body, signal, token);
    } catch {
      window.dispatchEvent(new Event('auth:expired'));
      throw new Error('Сессия истекла');
    }
  }

  if (!res.ok || !res.body) {
    if (res.status === 429) throw new Error('Слишком много запросов, подождите');
    throw new Error(`Ошибка ассистента (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const frames = buffer.split('\n\n');
    buffer = frames.pop() ?? '';
    for (const frame of frames) {
      const line = frame.trim();
      if (!line.startsWith('data:')) continue;
      const json = line.slice(5).trimStart();
      if (!json) continue;
      try {
        onEvent(JSON.parse(json) as ChatEvent);
      } catch {
        // ignore malformed frame
      }
    }
  }
}
