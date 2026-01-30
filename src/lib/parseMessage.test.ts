import { describe, it, expect } from 'vitest';
import {
  parseMessage,
  extractTextOnly,
  extractCards,
  hasCards,
  createCardMarker,
} from './parseMessage';

describe('parseMessage', () => {
  it('should parse plain text message', () => {
    const content = 'Hello, how can I help you today?';
    const result = parseMessage(content);
    
    expect(result.hasCards).toBe(false);
    expect(result.cardCount).toBe(0);
    expect(result.segments).toHaveLength(1);
    expect(result.segments[0]).toEqual({
      type: 'text',
      content: 'Hello, how can I help you today?',
    });
  });

  it('should parse message with hotel card', () => {
    const content = `Here's a great hotel for you:
[CARD:hotel]{"name":"Grand Hotel Paris","location":"Paris, France","price_per_night":250,"currency":"USD","rating":4.5}[/CARD]
Let me know if you'd like more options!`;
    
    const result = parseMessage(content);
    
    expect(result.hasCards).toBe(true);
    expect(result.cardCount).toBe(1);
    expect(result.segments).toHaveLength(3);
    
    expect(result.segments[0].type).toBe('text');
    expect(result.segments[1].type).toBe('card');
    expect(result.segments[2].type).toBe('text');
    
    if (result.segments[1].type === 'card') {
      expect(result.segments[1].cardType).toBe('hotel');
      expect(result.segments[1].data.name).toBe('Grand Hotel Paris');
    }
  });

  it('should parse message with flight card', () => {
    const content = `[CARD:flight]{"airline":"United Airlines","flight_number":"UA123","departure_airport":"SFO","arrival_airport":"JFK","departure_time":"2024-03-15T08:00:00Z","arrival_time":"2024-03-15T16:30:00Z","price":450,"currency":"USD"}[/CARD]`;
    
    const result = parseMessage(content);
    
    expect(result.hasCards).toBe(true);
    expect(result.cardCount).toBe(1);
    expect(result.segments).toHaveLength(1);
    
    if (result.segments[0].type === 'card') {
      expect(result.segments[0].cardType).toBe('flight');
      expect(result.segments[0].data.airline).toBe('United Airlines');
    }
  });

  it('should parse message with activity card', () => {
    const content = `[CARD:activity]{"name":"Eiffel Tower Tour","location":"Paris, France","description":"Skip-the-line guided tour","price":75,"currency":"EUR","duration":"3 hours"}[/CARD]`;
    
    const result = parseMessage(content);
    
    expect(result.hasCards).toBe(true);
    expect(result.cardCount).toBe(1);
    
    if (result.segments[0].type === 'card') {
      expect(result.segments[0].cardType).toBe('activity');
      expect(result.segments[0].data.name).toBe('Eiffel Tower Tour');
    }
  });

  it('should parse message with multiple cards', () => {
    const content = `Here are some options:
[CARD:hotel]{"name":"Hotel A","location":"Paris","price_per_night":150,"currency":"USD"}[/CARD]
And also:
[CARD:hotel]{"name":"Hotel B","location":"Paris","price_per_night":200,"currency":"USD"}[/CARD]
Let me know your preference.`;
    
    const result = parseMessage(content);
    
    expect(result.hasCards).toBe(true);
    expect(result.cardCount).toBe(2);
    expect(result.segments).toHaveLength(5);
  });

  it('should handle invalid JSON gracefully', () => {
    const content = `Here's a hotel:
[CARD:hotel]{invalid json}[/CARD]
Hope that helps!`;
    
    const result = parseMessage(content);
    
    // Should have text segments, invalid card included as text
    expect(result.cardCount).toBe(0);
    expect(result.segments.length).toBeGreaterThanOrEqual(1);
  });

  it('should handle missing required fields gracefully', () => {
    const content = `[CARD:hotel]{"name":"Incomplete Hotel"}[/CARD]`;
    
    const result = parseMessage(content);
    
    // Should fail validation and show error text
    expect(result.hasCards).toBe(false);
    expect(result.segments[0].type).toBe('text');
  });
});

describe('extractTextOnly', () => {
  it('should extract only text content', () => {
    const content = `Here's a hotel:
[CARD:hotel]{"name":"Hotel","location":"Paris","price_per_night":100,"currency":"USD"}[/CARD]
Enjoy your stay!`;
    
    const text = extractTextOnly(content);
    
    expect(text).toContain("Here's a hotel:");
    expect(text).toContain('Enjoy your stay!');
    expect(text).not.toContain('[CARD');
  });
});

describe('extractCards', () => {
  it('should extract all cards from message', () => {
    const content = `Options:
[CARD:hotel]{"name":"Hotel A","location":"Paris","price_per_night":100,"currency":"USD"}[/CARD]
[CARD:flight]{"airline":"Air France","flight_number":"AF123","departure_airport":"CDG","arrival_airport":"JFK","departure_time":"2024-03-15T10:00:00Z","arrival_time":"2024-03-15T14:00:00Z","price":600,"currency":"USD"}[/CARD]`;
    
    const cards = extractCards(content);
    
    expect(cards).toHaveLength(2);
    expect(cards[0].type).toBe('hotel');
    expect(cards[1].type).toBe('flight');
  });
});

describe('hasCards', () => {
  it('should return true for messages with cards', () => {
    const content = `[CARD:hotel]{"name":"Hotel","location":"Paris","price_per_night":100,"currency":"USD"}[/CARD]`;
    expect(hasCards(content)).toBe(true);
  });

  it('should return false for plain text', () => {
    expect(hasCards('Hello world')).toBe(false);
  });
});

describe('createCardMarker', () => {
  it('should create valid card marker', () => {
    const card = {
      type: 'hotel' as const,
      name: 'Test Hotel',
      location: 'Paris',
      price_per_night: 100,
      currency: 'USD',
    };
    
    const marker = createCardMarker(card);
    
    expect(marker).toContain('[CARD:hotel]');
    expect(marker).toContain('[/CARD]');
    expect(marker).toContain('"name":"Test Hotel"');
    
    // Verify it can be parsed back
    const result = parseMessage(marker);
    expect(result.hasCards).toBe(true);
    expect(result.cardCount).toBe(1);
  });
});
