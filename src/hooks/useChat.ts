'use client';

import { useCallback, useRef } from 'react';

interface ChatStreamOptions {
  conversationId?: string;
  userId?: string;
  onMetadata?: (metadata: { conversationId: string | null; model: string }) => void;
  onText?: (text: string) => void;
  onDone?: () => void;
  onError?: (error: string) => void;
}

interface UseChatReturn {
  sendMessage: (message: string, options?: ChatStreamOptions) => Promise<void>;
  abort: () => void;
  isStreaming: boolean;
}

export function useChat(): UseChatReturn {
  const abortControllerRef = useRef<AbortController | null>(null);
  const isStreamingRef = useRef(false);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      isStreamingRef.current = false;
    }
  }, []);

  const sendMessage = useCallback(async (message: string, options: ChatStreamOptions = {}) => {
    const { conversationId, userId, onMetadata, onText, onDone, onError } = options;

    // Abort any existing stream
    abort();

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    isStreamingRef.current = true;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationId,
          userId,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        
        // Process complete SSE events
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        let currentEvent = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7);
          } else if (line.startsWith('data: ') && currentEvent) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              
              switch (currentEvent) {
                case 'metadata':
                  onMetadata?.(parsed);
                  break;
                case 'text':
                  onText?.(parsed.text);
                  break;
                case 'done':
                  onDone?.();
                  break;
                case 'error':
                  onError?.(parsed.error);
                  break;
              }
            } catch {
              console.warn('Failed to parse SSE data:', data);
            }
            currentEvent = '';
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // User aborted, don't report as error
        return;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onError?.(errorMessage);
    } finally {
      isStreamingRef.current = false;
      abortControllerRef.current = null;
    }
  }, [abort]);

  return {
    sendMessage,
    abort,
    get isStreaming() {
      return isStreamingRef.current;
    },
  };
}
