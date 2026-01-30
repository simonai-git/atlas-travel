/**
 * Profile Summary API Endpoint
 * 
 * Returns a human-readable summary of the user's profile preferences.
 * Useful for displaying profile info in the UI.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProfileByUserId, getUserById } from '@/lib/db/schema';
import { generateProfileSummary } from '@/lib/profile/preference-extractor';

// ============================================================================
// Types
// ============================================================================

interface SummaryResponse {
  success: boolean;
  summary?: string;
  hasProfile: boolean;
  error?: string;
}

// ============================================================================
// GET - Get profile summary
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json<SummaryResponse>(
        { success: false, hasProfile: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json<SummaryResponse>(
        { success: false, hasProfile: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get profile
    const profile = await getProfileByUserId(userId);

    if (!profile || Object.keys(profile.profile_data).length === 0) {
      return NextResponse.json<SummaryResponse>({
        success: true,
        summary: 'No preferences saved yet. As you chat, I\'ll learn your travel preferences!',
        hasProfile: false,
      });
    }

    const summary = generateProfileSummary(profile.profile_data);

    return NextResponse.json<SummaryResponse>({
      success: true,
      summary,
      hasProfile: true,
    });
  } catch (error) {
    console.error('Profile summary error:', error);
    return NextResponse.json<SummaryResponse>(
      { success: false, hasProfile: false, error: 'Internal server error' },
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
