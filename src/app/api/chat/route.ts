import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from '@/lib/prompts/system-prompt';
import {
  getConversationById,
  getRecentMessages,
  getProfileByUserId,
  createOrUpdateProfile,
  createMessage,
  createConversation,
  getUserById,
  type Message,
  type ProfileData,
} from '@/lib/db/schema';
import {
  extractPreferencesFromMessage,
  mergeIntoProfile,
} from '@/lib/profile/preference-extractor';

// ============================================================================
// Types
// ============================================================================

interface ChatRequest {
  message: string;
  conversationId?: string;
  userId?: string;
}

interface MessageParam {
  role: 'user' | 'assistant';
  content: string;
}

// ============================================================================
// Anthropic Client
// ============================================================================

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-3-5-sonnet-20241022';
const MAX_TOKENS = 4096;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert database messages to Anthropic message format
 */
function messagesToAnthropicFormat(messages: Message[]): MessageParam[] {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
}

/**
 * Create a Server-Sent Events stream encoder
 */
function createSSEEncoder() {
  const encoder = new TextEncoder();
  
  return {
    encode(event: string, data: unknown): Uint8Array {
      const lines = [
        `event: ${event}`,
        `data: ${JSON.stringify(data)}`,
        '',
        '',
      ].join('\n');
      return encoder.encode(lines);
    },
  };
}

// ============================================================================
// POST Handler
// ============================================================================

export async function POST(request: NextRequest) {
  const sse = createSSEEncoder();
  
  // Parse request body
  let body: ChatRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { message, conversationId, userId } = body;

  // Validate required fields
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'Message is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'Anthropic API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Create the stream response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Load conversation history if conversationId provided
        let messages: MessageParam[] = [];
        let actualConversationId = conversationId;
        
        if (conversationId) {
          const conversation = await getConversationById(conversationId);
          if (conversation) {
            const dbMessages = await getRecentMessages(conversationId, 50);
            messages = messagesToAnthropicFormat(dbMessages);
          }
        }

        // Load user profile if userId provided
        let profileData: ProfileData | null = null;
        if (userId) {
          const user = await getUserById(userId);
          if (user) {
            const profile = await getProfileByUserId(userId);
            if (profile) {
              profileData = profile.profile_data;
            }
          }
        }

        // Build system prompt with user profile context
        const systemPrompt = buildSystemPrompt(profileData);

        // Add the new user message to the conversation
        messages.push({
          role: 'user',
          content: message.trim(),
        });

        // Create conversation if needed and we have a userId
        if (!actualConversationId && userId) {
          try {
            const newConversation = await createConversation(
              userId,
              message.slice(0, 50) + (message.length > 50 ? '...' : '')
            );
            actualConversationId = newConversation.id;
          } catch (error) {
            console.error('Failed to create conversation:', error);
            // Continue without persisting - user can still chat
          }
        }

        // Save user message to database
        if (actualConversationId) {
          try {
            await createMessage(actualConversationId, 'user', message.trim());
          } catch (error) {
            console.error('Failed to save user message:', error);
          }
        }

        // Extract preferences from user message and update profile
        if (userId) {
          try {
            const extracted = extractPreferencesFromMessage(message.trim());
            if (extracted.confidence > 0) {
              // There are some preferences to save
              const updatedProfile = mergeIntoProfile(profileData, extracted);
              await createOrUpdateProfile(userId, updatedProfile);
              // Update profileData for current context
              profileData = updatedProfile;
            }
          } catch (error) {
            console.error('Failed to extract/update preferences:', error);
            // Non-critical - continue with chat
          }
        }

        // Send conversation metadata
        controller.enqueue(
          sse.encode('metadata', {
            conversationId: actualConversationId || null,
            model: MODEL,
          })
        );

        // Call Anthropic API with streaming
        const streamResponse = await anthropic.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: systemPrompt,
          messages: messages,
        });

        // Collect full response for saving to database
        let fullResponse = '';

        // Stream the response
        for await (const event of streamResponse) {
          if (event.type === 'content_block_delta') {
            const delta = event.delta;
            if ('text' in delta) {
              fullResponse += delta.text;
              controller.enqueue(
                sse.encode('text', { text: delta.text })
              );
            }
          } else if (event.type === 'message_stop') {
            // Message complete
            controller.enqueue(sse.encode('done', { complete: true }));
          }
        }

        // Save assistant response to database
        if (actualConversationId && fullResponse) {
          try {
            await createMessage(actualConversationId, 'assistant', fullResponse);
          } catch (error) {
            console.error('Failed to save assistant message:', error);
          }
        }

        controller.close();
      } catch (error) {
        console.error('Chat API error:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        controller.enqueue(
          sse.encode('error', { error: errorMessage })
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}

// ============================================================================
// OPTIONS Handler (CORS)
// ============================================================================

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
