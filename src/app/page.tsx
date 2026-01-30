'use client';

import { useState, useCallback } from 'react';
import { ChatContainer } from '@/components/chat';
import type { Message } from '@/types';

// Demo responses for the travel agent
const demoResponses = [
  "I'd love to help you plan your trip! Could you tell me more about what kind of experience you're looking for? Are you interested in beaches, mountains, cities, or cultural experiences?",
  "That sounds wonderful! Based on your interests, I'd recommend considering these destinations:\n\n🏝️ **Bali, Indonesia** - Perfect blend of beaches, temples, and culture\n🗼 **Tokyo, Japan** - Amazing food, fascinating history, and modern wonders\n🏔️ **Swiss Alps** - Breathtaking mountain scenery and outdoor adventures\n\nWould you like me to dive deeper into any of these options?",
  "Great choice! Let me put together a sample itinerary for you. What dates are you thinking, and how many travelers will be joining?",
  "I've noted that down! Here's a preliminary 7-day itinerary I'd suggest:\n\n**Day 1-2:** Arrive and explore the local area\n**Day 3-4:** Cultural excursions and guided tours\n**Day 5-6:** Adventure activities and hidden gems\n**Day 7:** Relaxation and departure\n\nWould you like me to add specific activities or adjust anything?",
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [responseIndex, setResponseIndex] = useState(0);

  const handleSendMessage = useCallback((content: string) => {
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      createdAt: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: demoResponses[responseIndex % demoResponses.length],
        createdAt: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      setResponseIndex((prev) => prev + 1);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  }, [responseIndex]);

  return (
    <main className="dark">
      <ChatContainer
        messages={messages}
        onSendMessage={handleSendMessage}
        isTyping={isTyping}
      />
    </main>
  );
}
