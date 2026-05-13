'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowUp, Mic, MicOff, Square } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type SpeechRecognitionConstructor = new () => SpeechRecognition;

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  disabled: boolean;
  isStreaming: boolean;
}

const SPEECH_API_SUPPORTED = 1;
const SECURE_CONTEXT = 2;

const subscribeToSpeechCapability = () => () => {};

const getServerSpeechCapability = () => 0;

const getSpeechCapability = () => {
  if (typeof window === 'undefined') return 0;

  let capability = 0;
  if (window.SpeechRecognition ?? window.webkitSpeechRecognition) {
    capability |= SPEECH_API_SUPPORTED;
  }
  if (window.isSecureContext) {
    capability |= SECURE_CONTEXT;
  }

  return capability;
};

export function AssistantInput({
  value,
  onChange,
  onSubmit,
  onStop,
  disabled,
  isStreaming,
}: Props) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const voiceBaseValueRef = useRef('');
  const [isListening, setIsListening] = useState(false);
  const speechCapability = useSyncExternalStore(
    subscribeToSpeechCapability,
    getSpeechCapability,
    getServerSpeechCapability,
  );
  const speechApiSupported = Boolean(speechCapability & SPEECH_API_SUPPORTED);
  const speechSecureContext = Boolean(speechCapability & SECURE_CONTEXT);
  const speechSupported = speechApiSupported && speechSecureContext;

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled) onSubmit();
    }
  };

  const canSend = !disabled && value.trim().length > 0;
  const canUseVoice = useMemo(
    () => speechSupported && !disabled && !isStreaming,
    [disabled, isStreaming, speechSupported],
  );

  const showSpeechError = (error?: string) => {
    if (!speechSecureContext) {
      toast.error('Голосовой ввод доступен только через HTTPS или localhost');
      return;
    }

    if (error === 'not-allowed' || error === 'service-not-allowed') {
      toast.error('Браузер не дал доступ к микрофону');
      return;
    }

    if (error === 'no-speech') {
      toast.warning('Речь не распознана');
      return;
    }

    if (error === 'audio-capture') {
      toast.error('Микрофон не найден или занят другим приложением');
      return;
    }

    toast.error('Не удалось запустить голосовой ввод');
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
      return;
    }

    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      toast.error('Браузер не поддерживает голосовой ввод');
      return;
    }

    if (!canUseVoice) {
      showSpeechError();
      return;
    }

    const recognition = new Recognition();
    recognition.lang = 'ru-RU';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0]?.transcript ?? '';
      }
      onChange(`${voiceBaseValueRef.current}${transcript}`.trimStart());
    };

    recognition.onerror = (event) => {
      showSpeechError(event.error);
      stopListening();
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    voiceBaseValueRef.current = value.trimEnd() ? `${value.trimEnd()} ` : '';
    setIsListening(true);
    try {
      recognition.start();
    } catch {
      stopListening();
      showSpeechError();
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSend) onSubmit();
      }}
      className={cn(
        'border-input bg-background focus-within:border-primary/50 flex items-end gap-2 rounded-lg border px-2 py-2 transition-colors',
      )}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        disabled={disabled && !isStreaming}
        rows={2}
        placeholder={isStreaming ? 'Идёт генерация ответа…' : 'Спросите ассистента…'}
        className={cn(
          'placeholder:text-muted-foreground/70 max-h-24 min-h-10 flex-1 resize-none overflow-y-auto bg-transparent px-0 py-0.5 text-sm leading-5 outline-none disabled:opacity-60',
        )}
      />
      {speechApiSupported && !isStreaming && (
        <button
          type="button"
          onClick={toggleVoiceInput}
          disabled={!canUseVoice}
          aria-label={isListening ? 'Остановить голосовой ввод' : 'Голосовой ввод'}
          title={isListening ? 'Остановить голосовой ввод' : 'Голосовой ввод'}
          className={cn(
            'mb-1 flex size-8 shrink-0 items-center justify-center rounded-md transition-colors',
            isListening
              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer'
              : canUseVoice
                ? 'bg-muted text-foreground hover:bg-muted/80 cursor-pointer'
                : 'bg-muted text-muted-foreground/50 cursor-not-allowed',
          )}
        >
          {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
        </button>
      )}
      {isStreaming ? (
        <button
          type="button"
          onClick={onStop}
          aria-label="Остановить"
          className={cn(
            'bg-destructive text-destructive-foreground mb-1 flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors',
          )}
        >
          <Square className="size-3 fill-current" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Отправить"
          className={cn(
            'mb-1 flex size-8 shrink-0 items-center justify-center rounded-md transition-colors',
            canSend
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer'
              : 'bg-muted text-muted-foreground/50 cursor-not-allowed',
          )}
        >
          <ArrowUp className="size-4" />
        </button>
      )}
    </form>
  );
}
