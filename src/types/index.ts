// Chat message types for Atlas Travel Agent
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// Travel-specific types
export interface TravelDestination {
  name: string;
  country: string;
  description?: string;
}

export interface TravelItinerary {
  id: string;
  destination: TravelDestination;
  startDate: Date;
  endDate: Date;
  activities: string[];
}
