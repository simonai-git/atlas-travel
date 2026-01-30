'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Message } from '@/types';
import type { ConversationItem } from '@/components/sidebar';

interface ConversationData {
  id: string;
  title: string;
  messages: Message[];
}

interface UseConversationsReturn {
  // Conversation list
  conversations: ConversationItem[];
  isLoadingList: boolean;
  
  // Current conversation
  currentConversationId: string | null;
  currentMessages: Message[];
  isLoadingConversation: boolean;
  
  // Actions
  loadConversations: () => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  createConversation: () => Promise<string>;
  deleteConversation: (id: string) => Promise<void>;
  addMessage: (message: Message) => void;
  updateTitle: (id: string, title: string) => Promise<void>;
  clearCurrentConversation: () => void;
}

// Generate a title from the first user message
export function generateTitleFromMessage(content: string): string {
  // Take first 50 chars, try to end at a word boundary
  const maxLength = 50;
  if (content.length <= maxLength) {
    return content;
  }
  
  const truncated = content.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 20) {
    return truncated.slice(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  // Load all conversations
  const loadConversations = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const response = await fetch('/api/conversations');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      
      const data = await response.json();
      setConversations(
        data.conversations.map((conv: { id: string; title: string; updatedAt: string }) => ({
          id: conv.id,
          title: conv.title,
          updatedAt: new Date(conv.updatedAt),
        }))
      );
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  // Select and load a conversation
  const selectConversation = useCallback(async (id: string) => {
    setIsLoadingConversation(true);
    setCurrentConversationId(id);
    
    try {
      const response = await fetch(`/api/conversations/${id}`);
      if (!response.ok) throw new Error('Failed to fetch conversation');
      
      const data = await response.json();
      setCurrentMessages(
        data.messages.map((msg: { id: string; role: 'user' | 'assistant'; content: string; createdAt: string }) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: new Date(msg.createdAt),
        }))
      );
    } catch (error) {
      console.error('Error loading conversation:', error);
      setCurrentMessages([]);
    } finally {
      setIsLoadingConversation(false);
    }
  }, []);

  // Create a new conversation
  const createConversation = useCallback(async (): Promise<string> => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Conversation' }),
      });
      
      if (!response.ok) throw new Error('Failed to create conversation');
      
      const data = await response.json();
      
      // Add to list
      setConversations((prev) => [
        {
          id: data.id,
          title: data.title,
          updatedAt: new Date(data.updatedAt),
        },
        ...prev,
      ]);
      
      // Set as current
      setCurrentConversationId(data.id);
      setCurrentMessages([]);
      
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }, []);

  // Delete a conversation
  const deleteConversation = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete conversation');
      
      // Remove from list
      setConversations((prev) => prev.filter((conv) => conv.id !== id));
      
      // Clear if it was current
      if (currentConversationId === id) {
        setCurrentConversationId(null);
        setCurrentMessages([]);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }, [currentConversationId]);

  // Add a message to current conversation
  const addMessage = useCallback((message: Message) => {
    setCurrentMessages((prev) => [...prev, message]);
    
    // Update the conversation's updatedAt in the list
    if (currentConversationId) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? { ...conv, updatedAt: new Date() }
            : conv
        ).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      );
    }
  }, [currentConversationId]);

  // Update conversation title
  const updateTitle = useCallback(async (id: string, title: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      
      if (!response.ok) throw new Error('Failed to update title');
      
      // Update in list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === id ? { ...conv, title } : conv
        )
      );
    } catch (error) {
      console.error('Error updating title:', error);
    }
  }, []);

  // Clear current conversation (for starting fresh without API)
  const clearCurrentConversation = useCallback(() => {
    setCurrentConversationId(null);
    setCurrentMessages([]);
  }, []);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    isLoadingList,
    currentConversationId,
    currentMessages,
    isLoadingConversation,
    loadConversations,
    selectConversation,
    createConversation,
    deleteConversation,
    addMessage,
    updateTitle,
    clearCurrentConversation,
  };
}
