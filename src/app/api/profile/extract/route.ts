/**
 * Profile Extraction API Endpoint
 * 
 * Analyzes conversation messages to extract user preferences
 * and optionally updates the user's profile.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getProfileByUserId,
  createOrUpdateProfile,
  getMessagesByConversationId,
  getUserById,
  type ProfileData,
} from '@/lib/db/schema';
import {
  extractPreferencesFromConversation,
  extractPreferencesFromMessage,
  mergeIntoProfile,
  generateProfileSummary,
  type ExtractedPreferences,
} from '@/lib/profile/preference-extractor';

// ============================================================================
// Types
// ============================================================================

interface ExtractRequest {
  // Option 1: Extract from raw messages
  messages?: Array<{ role: string; content: string }>;
  // Option 2: Extract from conversation ID
  conversationId?: string;
  // Option 3: Extract from single message
  message?: string;
  // User ID for saving to profile
  userId?: string;
  // Whether to save extracted preferences to profile
  saveToProfile?: boolean;
}

interface ExtractResponse {
  success: boolean;
  extracted?: ExtractedPreferences;
  profile?: {
    userId: string;
    data: ProfileData;
    summary: string;
  };
  error?: string;
}

// ============================================================================
// POST - Extract preferences
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body: ExtractRequest = await request.json();
    const { messages, conversationId, message, userId, saveToProfile } = body;

    // Determine extraction source
    let extracted: ExtractedPreferences;

    if (message) {
      // Single message extraction
      extracted = extractPreferencesFromMessage(message);
    } else if (messages && messages.length > 0) {
      // Multiple messages provided directly
      extracted = extractPreferencesFromConversation(messages);
    } else if (conversationId) {
      // Load messages from conversation
      const dbMessages = await getMessagesByConversationId(conversationId);
      if (!dbMessages || dbMessages.length === 0) {
        return NextResponse.json<ExtractResponse>(
          { success: false, error: 'Conversation not found or empty' },
          { status: 404 }
        );
      }
      extracted = extractPreferencesFromConversation(
        dbMessages.map((m) => ({ role: m.role, content: m.content }))
      );
    } else {
      return NextResponse.json<ExtractResponse>(
        { success: false, error: 'Must provide message, messages array, or conversationId' },
        { status: 400 }
      );
    }

    // If saveToProfile is true and userId is provided, update the profile
    if (saveToProfile && userId) {
      // Verify user exists
      const user = await getUserById(userId);
      if (!user) {
        return NextResponse.json<ExtractResponse>(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      // Get existing profile
      const existingProfile = await getProfileByUserId(userId);
      const existingData = existingProfile?.profile_data || null;

      // Merge extracted preferences into existing profile
      const mergedProfile = mergeIntoProfile(existingData, extracted);

      // Save updated profile
      const profile = await createOrUpdateProfile(userId, mergedProfile);

      return NextResponse.json<ExtractResponse>({
        success: true,
        extracted,
        profile: {
          userId: profile.user_id,
          data: profile.profile_data,
          summary: generateProfileSummary(profile.profile_data),
        },
      });
    }

    // Just return extracted preferences without saving
    return NextResponse.json<ExtractResponse>({
      success: true,
      extracted,
    });
  } catch (error) {
    console.error('Profile extraction error:', error);
    return NextResponse.json<ExtractResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// OPTIONS - CORS preflight
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
