'use client';

import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Plan your next adventure...',
  className,
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setValue('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  return (
    <div
      className={cn(
        'border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-xl p-4',
        className
      )}
    >
      <div className="mx-auto flex max-w-3xl items-end gap-3">
        {/* Attachment button (decorative for now) */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
          disabled={disabled}
        >
          <Paperclip className="size-5" />
          <span className="sr-only">Attach file</span>
        </Button>

        {/* Input area */}
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              'min-h-[44px] max-h-[200px] resize-none rounded-2xl border-zinc-700',
              'bg-zinc-800/50 px-4 py-3 pr-12 text-sm text-zinc-100',
              'placeholder:text-zinc-500',
              'focus:border-teal-500/50 focus:ring-teal-500/20',
              'scrollbar-thin scrollbar-thumb-zinc-700'
            )}
          />
        </div>

        {/* Send button */}
        <Button
          type="button"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          size="icon"
          className={cn(
            'shrink-0 rounded-xl transition-all duration-200',
            value.trim()
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white shadow-lg shadow-teal-500/25'
              : 'bg-zinc-800 text-zinc-500'
          )}
        >
          <Send className="size-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>

      {/* Helper text */}
      <p className="mt-2 text-center text-[11px] text-zinc-600">
        Press Enter to send, Shift + Enter for new line
      </p>
    </div>
  );
}
