import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => {
  const MockAnthropic = class {
    messages = {
      stream: vi.fn().mockImplementation(async function* () {
        yield {
          type: 'content_block_delta',
          delta: { text: 'Hello! ' },
        };
        yield {
          type: 'content_block_delta',
          delta: { text: "I'm Atlas." },
        };
        yield { type: 'message_stop' };
      }),
    };
  };
  return { default: MockAnthropic };
});

// Mock the database functions
vi.mock('@/lib/db/schema', () => ({
  getConversationById: vi.fn().mockResolvedValue(null),
  getRecentMessages: vi.fn().mockResolvedValue([]),
  getProfileByUserId: vi.fn().mockResolvedValue(null),
  getUserById: vi.fn().mockResolvedValue(null),
  createMessage: vi.fn().mockResolvedValue({ id: 'msg-1' }),
  createConversation: vi.fn().mockResolvedValue({ id: 'conv-1' }),
}));

// Mock the system prompt builder
vi.mock('@/lib/prompts/system-prompt', () => ({
  buildSystemPrompt: vi.fn().mockReturnValue('You are Atlas, a travel assistant.'),
}));

// Mock preference extractor
vi.mock('@/lib/profile/preference-extractor', () => ({
  extractPreferencesFromMessage: vi.fn().mockReturnValue({ confidence: 0 }),
  mergeIntoProfile: vi.fn().mockReturnValue({}),
}));

// Set environment variable
vi.stubEnv('ANTHROPIC_API_KEY', 'test-api-key');

describe('Chat API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject requests without a message', async () => {
    const { POST } = await import('./route');
    
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.error).toBe('Message is required');
  });

  it('should reject requests with empty message', async () => {
    const { POST } = await import('./route');
    
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '   ' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.error).toBe('Message is required');
  });

  it('should reject invalid JSON', async () => {
    const { POST } = await import('./route');
    
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.error).toBe('Invalid JSON body');
  });

  it('should return SSE stream for valid request', async () => {
    const { POST } = await import('./route');
    
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello, can you help me plan a trip?' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
  });

  it('should handle OPTIONS request for CORS', async () => {
    const { OPTIONS } = await import('./route');
    
    const response = await OPTIONS();
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
  });
});
