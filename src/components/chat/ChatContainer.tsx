'use client';

import { useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Message } from '@/types';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { Plane } from 'lucide-react';

interface ChatContainerProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isTyping?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ChatContainer({
  messages,
  onSendMessage,
  isTyping = false,
  disabled = false,
  className,
}: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  return (
    <div
      className={cn(
        'flex h-screen flex-col bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950',
        className
      )}
    >
      {/* Header */}
      <header className="shrink-0 border-b border-zinc-800/50 bg-zinc-900/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/20">
            <Plane className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">Atlas Travel</h1>
            <p className="text-xs text-zinc-500">Your AI travel companion</p>
          </div>
        </div>
      </header>

      {/* Messages area */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="mx-auto max-w-3xl">
          <MessageList messages={messages} isTyping={isTyping} />
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input area - fixed at bottom */}
      <ChatInput
        onSend={onSendMessage}
        disabled={disabled || isTyping}
        className="shrink-0"
      />
    </div>
  );
}
