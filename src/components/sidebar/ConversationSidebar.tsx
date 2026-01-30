'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  MessageSquare,
  Plus,
  Trash2,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export interface ConversationItem {
  id: string;
  title: string;
  updatedAt: Date;
  messageCount?: number;
}

interface ConversationSidebarProps {
  conversations: ConversationItem[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  isLoading?: boolean;
  className?: string;
}

// Desktop sidebar component
function DesktopSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isLoading,
  isCollapsed,
  onToggleCollapse,
}: ConversationSidebarProps & {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div
      className={cn(
        'relative hidden md:flex flex-col h-screen border-r border-zinc-800/50 bg-zinc-900/50 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-72'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-800/50">
        {!isCollapsed && (
          <h2 className="text-sm font-semibold text-zinc-200">Conversations</h2>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleCollapse}
          className="text-zinc-400 hover:text-zinc-200 ml-auto"
        >
          {isCollapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </Button>
      </div>

      {/* New Conversation Button */}
      <div className="p-3">
        <Button
          onClick={onNewConversation}
          variant="outline"
          className={cn(
            'w-full border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-200',
            isCollapsed && 'px-0'
          )}
        >
          <Plus className="size-4" />
          {!isCollapsed && <span>New Chat</span>}
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 px-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="size-6 animate-spin rounded-full border-2 border-zinc-600 border-t-teal-500" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="py-8 text-center">
            <MessageSquare className="mx-auto size-8 text-zinc-600 mb-2" />
            {!isCollapsed && (
              <p className="text-sm text-zinc-500">No conversations yet</p>
            )}
          </div>
        ) : (
          <div className="space-y-1 pb-4">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  'group relative rounded-lg transition-colors',
                  currentConversationId === conv.id
                    ? 'bg-zinc-800'
                    : 'hover:bg-zinc-800/50'
                )}
                onMouseEnter={() => setHoveredId(conv.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <button
                  onClick={() => onSelectConversation(conv.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg',
                    isCollapsed && 'flex justify-center'
                  )}
                >
                  {isCollapsed ? (
                    <MessageSquare className="size-4 text-zinc-400" />
                  ) : (
                    <>
                      <p className="text-sm font-medium text-zinc-200 truncate pr-8">
                        {conv.title}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {formatRelativeTime(conv.updatedAt)}
                      </p>
                    </>
                  )}
                </button>
                {!isCollapsed && hoveredId === conv.id && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// Mobile drawer component
function MobileDrawer({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isLoading,
  isOpen,
  onOpenChange,
}: ConversationSidebarProps & {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-zinc-400 hover:text-zinc-200"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 bg-zinc-900 border-zinc-800">
        <SheetHeader className="p-4 border-b border-zinc-800">
          <SheetTitle className="text-zinc-200">Conversations</SheetTitle>
        </SheetHeader>

        {/* New Conversation Button */}
        <div className="p-3">
          <Button
            onClick={() => {
              onNewConversation();
              onOpenChange(false);
            }}
            variant="outline"
            className="w-full border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-200"
          >
            <Plus className="size-4" />
            <span>New Chat</span>
          </Button>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1 h-[calc(100vh-140px)] px-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="size-6 animate-spin rounded-full border-2 border-zinc-600 border-t-teal-500" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="py-8 text-center">
              <MessageSquare className="mx-auto size-8 text-zinc-600 mb-2" />
              <p className="text-sm text-zinc-500">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1 pb-4">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={cn(
                    'group relative rounded-lg transition-colors',
                    currentConversationId === conv.id
                      ? 'bg-zinc-800'
                      : 'hover:bg-zinc-800/50'
                  )}
                >
                  <button
                    onClick={() => {
                      onSelectConversation(conv.id);
                      onOpenChange(false);
                    }}
                    className="w-full text-left p-3 rounded-lg"
                  >
                    <p className="text-sm font-medium text-zinc-200 truncate pr-8">
                      {conv.title}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {formatRelativeTime(conv.updatedAt)}
                    </p>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// Main exported component
export function ConversationSidebar(props: ConversationSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <DesktopSidebar
        {...props}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      
      {/* Mobile Drawer Trigger - rendered separately in header */}
      <MobileDrawer
        {...props}
        isOpen={isMobileOpen}
        onOpenChange={setIsMobileOpen}
      />
    </>
  );
}

// Export MobileDrawerTrigger for use in header
export function MobileDrawerTrigger({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isLoading,
}: ConversationSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MobileDrawer
      conversations={conversations}
      currentConversationId={currentConversationId}
      onSelectConversation={onSelectConversation}
      onNewConversation={onNewConversation}
      onDeleteConversation={onDeleteConversation}
      isLoading={isLoading}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    />
  );
}

// Utility function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } else if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return 'Just now';
  }
}
