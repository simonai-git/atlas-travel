'use client';

import { cn } from '@/lib/utils';
import type { Message } from '@/types';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  isTyping?: boolean;
  className?: string;
}

export function MessageList({ messages, isTyping = false, className }: MessageListProps) {
  if (messages.length === 0 && !isTyping) {
    return (
      <div className={cn('flex flex-1 flex-col items-center justify-center gap-4 p-8', className)}>
        <div className="rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 p-6">
          <svg
            className="size-12 text-teal-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
            />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-zinc-200">
            Where would you like to go?
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Start a conversation to plan your next adventure
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-1 py-4', className)}>
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isTyping && <TypingIndicator />}
    </div>
  );
}
