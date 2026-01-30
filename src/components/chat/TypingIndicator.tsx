'use client';

import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 px-4 py-3',
        className
      )}
    >
      <div className="flex items-center gap-1.5 rounded-2xl bg-zinc-800/80 px-4 py-3 backdrop-blur-sm">
        <span className="size-2 animate-bounce rounded-full bg-teal-400 [animation-delay:-0.3s]" />
        <span className="size-2 animate-bounce rounded-full bg-teal-400 [animation-delay:-0.15s]" />
        <span className="size-2 animate-bounce rounded-full bg-teal-400" />
      </div>
    </div>
  );
}
