import { useEffect, useRef, useState } from 'react';

const DEFAULT_DELAY_MS = 500;

export function useDebouncedSearch(onCommit?: () => void, delayMs: number = DEFAULT_DELAY_MS) {
  const [input, setInput] = useState('');
  const [debounced, setDebounced] = useState('');
  const commitRef = useRef(onCommit);

  useEffect(() => {
    commitRef.current = onCommit;
  }, [onCommit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(input);
      commitRef.current?.();
    }, delayMs);
    return () => clearTimeout(timer);
  }, [input, delayMs]);

  return { input, setInput, debounced };
}
