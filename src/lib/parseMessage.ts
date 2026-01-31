/**
 * Message Parser for Atlas Travel
 * 
 * Parses AI responses to detect and extract embedded travel cards.
 * 
 * Card Marker Format:
 * [CARD:type]{...json...}[/CARD]
 * 
 * Supported types: hotel, flight
 * 
 * Example:
 * "Here's a great hotel for you:
 * [CARD:hotel]{"name":"Marriott","location":"Paris","price_per_night":150,"currency":"USD"}[/CARD]
 * Let me know if you'd like more options!"
 */

import type { 
  TravelCard, 
  HotelCard, 
  FlightCard 
} from '@/lib/db/schema';

// ============================================================================
// Types
// ============================================================================

export type MessageSegment = TextSegment | CardSegment;

export interface TextSegment {
  type: 'text';
  content: string;
}

export interface CardSegment {
  type: 'card';
  cardType: 'hotel' | 'flight';
  data: TravelCard;
}

export interface ParseResult {
  segments: MessageSegment[];
  hasCards: boolean;
  cardCount: number;
}

// ============================================================================
// Validation Schemas
// ============================================================================

function isValidHotelCard(data: unknown): data is HotelCard {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    obj.type === 'hotel' &&
    typeof obj.name === 'string' &&
    typeof obj.location === 'string' &&
    typeof obj.price_per_night === 'number' &&
    typeof obj.currency === 'string'
  );
}

function isValidFlightCard(data: unknown): data is FlightCard {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    obj.type === 'flight' &&
    typeof obj.airline === 'string' &&
    typeof obj.flight_number === 'string' &&
    typeof obj.departure_airport === 'string' &&
    typeof obj.arrival_airport === 'string' &&
    typeof obj.departure_time === 'string' &&
    typeof obj.arrival_time === 'string' &&
    typeof obj.price === 'number' &&
    typeof obj.currency === 'string'
  );
}

function validateCard(type: string, data: unknown): TravelCard | null {
  switch (type) {
    case 'hotel':
      if (isValidHotelCard(data)) return data;
      break;
    case 'flight':
      if (isValidFlightCard(data)) return data;
      break;
  }
  return null;
}

// ============================================================================
// Parser
// ============================================================================

// Regex pattern for card markers: [CARD:type]{...json...}[/CARD]
const CARD_PATTERN = /\[CARD:(hotel|flight)\]([\s\S]*?)\[\/CARD\]/g;

/**
 * Parse a message string into segments of text and cards.
 * 
 * @param content - The raw message content from the AI
 * @returns ParseResult with segments array and metadata
 */
export function parseMessage(content: string): ParseResult {
  const segments: MessageSegment[] = [];
  let lastIndex = 0;
  let cardCount = 0;

  // Reset regex state
  CARD_PATTERN.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = CARD_PATTERN.exec(content)) !== null) {
    const [fullMatch, cardType, jsonContent] = match;
    const matchStart = match.index;

    // Add preceding text if any
    if (matchStart > lastIndex) {
      const textContent = content.slice(lastIndex, matchStart).trim();
      if (textContent) {
        segments.push({
          type: 'text',
          content: textContent,
        });
      }
    }

    // Try to parse and validate the card JSON
    try {
      const cardData = JSON.parse(jsonContent.trim());
      // Ensure type field matches marker type
      cardData.type = cardType;
      
      const validatedCard = validateCard(cardType, cardData);
      if (validatedCard) {
        segments.push({
          type: 'card',
          cardType: cardType as 'hotel' | 'flight',
          data: validatedCard,
        });
        cardCount++;
      } else {
        // Invalid card structure - include as text for debugging
        console.warn(`Invalid ${cardType} card data:`, cardData);
        segments.push({
          type: 'text',
          content: `[Invalid ${cardType} card]`,
        });
      }
    } catch (error) {
      // JSON parse error - include marker as plain text
      console.warn('Failed to parse card JSON:', error);
      segments.push({
        type: 'text',
        content: fullMatch,
      });
    }

    lastIndex = matchStart + fullMatch.length;
  }

  // Add remaining text after last card
  if (lastIndex < content.length) {
    const textContent = content.slice(lastIndex).trim();
    if (textContent) {
      segments.push({
        type: 'text',
        content: textContent,
      });
    }
  }

  // If no cards found, return entire content as text
  if (segments.length === 0 && content.trim()) {
    segments.push({
      type: 'text',
      content: content.trim(),
    });
  }

  return {
    segments,
    hasCards: cardCount > 0,
    cardCount,
  };
}

/**
 * Extract only text content from a message (strips cards).
 * Useful for displaying plain text previews.
 */
export function extractTextOnly(content: string): string {
  const { segments } = parseMessage(content);
  return segments
    .filter((s): s is TextSegment => s.type === 'text')
    .map((s) => s.content)
    .join(' ');
}

/**
 * Extract only cards from a message.
 * Useful for accessing card data programmatically.
 */
export function extractCards(content: string): TravelCard[] {
  const { segments } = parseMessage(content);
  return segments
    .filter((s): s is CardSegment => s.type === 'card')
    .map((s) => s.data);
}

/**
 * Check if a message contains any cards.
 */
export function hasCards(content: string): boolean {
  return CARD_PATTERN.test(content);
}

/**
 * Create a card marker string for embedding in AI responses.
 * Useful for testing or manually creating card content.
 */
export function createCardMarker(card: TravelCard): string {
  return `[CARD:${card.type}]${JSON.stringify(card)}[/CARD]`;
}
