'use client';

import { useMemo, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Message } from '@/types';
import { Plane, User } from 'lucide-react';
import { parseMessage, type MessageSegment, type CardSegment } from '@/lib/parseMessage';
import { HotelCard, FlightCard, ActivityCard } from '@/components/cards';
import type { TravelCard } from '@/lib/db/schema';

interface MessageBubbleProps {
  message: Message;
  className?: string;
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Simple markdown renderer for **bold** and *italic* text
 */
function renderSimpleMarkdown(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  // Match **bold** or *italic* patterns
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Check if it's bold (**) or italic (*)
    if (match[2]) {
      // Bold text (captured in group 2)
      parts.push(<strong key={key++} className="font-semibold">{match[2]}</strong>);
    } else if (match[3]) {
      // Italic text (captured in group 3)
      parts.push(<em key={key++}>{match[3]}</em>);
    }

    lastIndex = regex.lastIndex;
  }

  // Add remaining text after the last match
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

function TravelCardRenderer({ card }: { card: TravelCard }) {
  switch (card.type) {
    case 'hotel':
      return <HotelCard data={card} className="w-full max-w-sm" />;
    case 'flight':
      return <FlightCard data={card} className="w-full max-w-sm" />;
    case 'activity':
      return <ActivityCard data={card} className="w-full max-w-sm" />;
    default:
      return null;
  }
}

function MessageContent({ content, isUser }: { content: string; isUser: boolean }) {
  const parseResult = useMemo(() => {
    // Only parse assistant messages for cards
    if (isUser) {
      return { segments: [{ type: 'text' as const, content }], hasCards: false, cardCount: 0 };
    }
    return parseMessage(content);
  }, [content, isUser]);

  // Render text with markdown support
  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {i > 0 && <br />}
        {renderSimpleMarkdown(line)}
      </span>
    ));
  };

  // User messages or messages without cards - simple rendering
  if (isUser || !parseResult.hasCards) {
    return (
      <div
        className={cn(
          'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-sm'
            : 'bg-zinc-800/80 text-zinc-100 backdrop-blur-sm border border-zinc-700/50 rounded-tl-sm'
        )}
      >
        <p className="whitespace-pre-wrap">{isUser ? content : renderText(content)}</p>
      </div>
    );
  }

  // Assistant messages with cards - render mixed content
  return (
    <div className="flex flex-col gap-3">
      {parseResult.segments.map((segment, index) => {
        if (segment.type === 'text') {
          return (
            <div
              key={index}
              className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed bg-zinc-800/80 text-zinc-100 backdrop-blur-sm border border-zinc-700/50 rounded-tl-sm"
            >
              <p className="whitespace-pre-wrap">{renderText(segment.content)}</p>
            </div>
          );
        }

        // Card segment
        const cardSegment = segment as CardSegment;
        return (
          <div key={index} className="animate-in fade-in-50 slide-in-from-left-2 duration-300">
            <TravelCardRenderer card={cardSegment.data} />
          </div>
        );
      })}
    </div>
  );
}

export function MessageBubble({ message, className }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex w-full gap-3 px-4 py-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
        isUser ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      {/* Avatar */}
      <Avatar className={cn(
        'size-8 shrink-0 ring-2',
        isUser 
          ? 'ring-cyan-500/30' 
          : 'ring-teal-500/30'
      )}>
        <AvatarFallback
          className={cn(
            'text-white',
            isUser
              ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
              : 'bg-gradient-to-br from-teal-600 to-emerald-700'
          )}
        >
          {isUser ? <User className="size-4" /> : <Plane className="size-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message content */}
      <div
        className={cn(
          'flex max-w-[85%] flex-col gap-1',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <MessageContent content={message.content} isUser={isUser} />
        
        {/* Timestamp */}
        <span className="px-1 text-[10px] text-zinc-500">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}
