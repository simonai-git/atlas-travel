'use client';

import { useRef, useEffect, useCallback, useState, useMemo, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Message } from '@/types';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { WelcomeScreen, QuickPreferences } from '@/components/welcome';
import { Plane } from 'lucide-react';

type ViewOverride = 'preferences' | null;

interface ChatContainerProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isTyping?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  mobileMenuTrigger?: ReactNode;
  isNewUser?: boolean;
  onPreferencesComplete?: (prefs: {
    budget?: 'budget' | 'moderate' | 'luxury';
    travelStyle?: 'solo' | 'couple' | 'family' | 'friends';
    interests?: ('relaxation' | 'adventure' | 'culture' | 'nightlife')[];
  }) => void;
}

export function ChatContainer({
  messages,
  onSendMessage,
  isTyping = false,
  isLoading = false,
  disabled = false,
  className,
  mobileMenuTrigger,
  isNewUser = false,
  onPreferencesComplete,
}: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  // Only store the override state (preferences), derive the rest
  const [viewOverride, setViewOverride] = useState<ViewOverride>(null);
  
  // Derive the actual view state from props and override
  const viewState = useMemo(() => {
    if (viewOverride === 'preferences') return 'preferences';
    if (messages.length > 0) return 'chat';
    return 'welcome';
  }, [viewOverride, messages.length]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleStartConversation = useCallback((prompt: string) => {
    setViewOverride(null);
    onSendMessage(prompt);
  }, [onSendMessage]);

  const handlePersonalize = useCallback(() => {
    setViewOverride('preferences');
  }, []);

  const handlePreferencesComplete = useCallback((prefs: {
    budget?: 'budget' | 'moderate' | 'luxury';
    travelStyle?: 'solo' | 'couple' | 'family' | 'friends';
    interests?: ('relaxation' | 'adventure' | 'culture' | 'nightlife')[];
  }) => {
    setViewOverride(null);
    onPreferencesComplete?.(prefs);
  }, [onPreferencesComplete]);

  const handleSkipPreferences = useCallback(() => {
    setViewOverride(null);
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-2 border-zinc-600 border-t-teal-500" />
        </div>
      );
    }

    // Show chat if there are messages
    if (messages.length > 0) {
      return (
        <>
          <MessageList messages={messages} isTyping={isTyping} />
          <div ref={bottomRef} />
        </>
      );
    }

    // No messages - show onboarding flow
    switch (viewState) {
      case 'preferences':
        return (
          <QuickPreferences
            onComplete={handlePreferencesComplete}
            onSkip={handleSkipPreferences}
          />
        );
      case 'welcome':
      default:
        return (
          <WelcomeScreen 
            onStartConversation={handleStartConversation}
            onPersonalize={handlePersonalize}
            showPersonalizeOption={isNewUser}
          />
        );
    }
  };

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
          {/* Mobile menu trigger */}
          {mobileMenuTrigger && (
            <div className="md:hidden">
              {mobileMenuTrigger}
            </div>
          )}
          
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
          {renderContent()}
        </div>
      </ScrollArea>

      {/* Input area - fixed at bottom, hidden during preferences */}
      {viewState !== 'preferences' && (
        <ChatInput
          onSend={handleStartConversation}
          disabled={disabled || isTyping || isLoading}
          className="shrink-0"
        />
      )}
    </div>
  );
}
