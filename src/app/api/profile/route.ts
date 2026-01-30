/**
 * User Profile API Endpoints
 * 
 * Provides CRUD operations for user profiles including:
 * - GET: Retrieve user profile
 * - POST: Create new profile
 * - PATCH: Update existing profile
 * - DELETE: Remove profile
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getProfileByUserId,
  createOrUpdateProfile,
  deleteProfile,
  getUserById,
  type ProfileData,
} from '@/lib/db/schema';
import { generateProfileSummary } from '@/lib/profile/preference-extractor';

// ============================================================================
// Types
// ============================================================================

interface ProfileRequest {
  userId: string;
  profileData?: ProfileData;
}

interface ProfileResponse {
  success: boolean;
  profile?: {
    userId: string;
    data: ProfileData;
    summary: string;
    lastUpdated: Date;
  };
  error?: string;
}

// ============================================================================
// GET - Retrieve user profile
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json<ProfileResponse>(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json<ProfileResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get profile
    const profile = await getProfileByUserId(userId);

    if (!profile) {
      // Return empty profile if none exists
      return NextResponse.json<ProfileResponse>({
        success: true,
        profile: {
          userId,
          data: {},
          summary: 'No preferences saved yet.',
          lastUpdated: new Date(),
        },
      });
    }

    return NextResponse.json<ProfileResponse>({
      success: true,
      profile: {
        userId: profile.user_id,
        data: profile.profile_data,
        summary: generateProfileSummary(profile.profile_data),
        lastUpdated: profile.last_updated,
      },
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json<ProfileResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Create or replace user profile
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body: ProfileRequest = await request.json();
    const { userId, profileData } = body;

    if (!userId) {
      return NextResponse.json<ProfileResponse>(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json<ProfileResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Create or update profile
    const profile = await createOrUpdateProfile(userId, profileData || {});

    return NextResponse.json<ProfileResponse>({
      success: true,
      profile: {
        userId: profile.user_id,
        data: profile.profile_data,
        summary: generateProfileSummary(profile.profile_data),
        lastUpdated: profile.last_updated,
      },
    });
  } catch (error) {
    console.error('Profile POST error:', error);
    return NextResponse.json<ProfileResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH - Update specific profile fields
// ============================================================================

export async function PATCH(request: NextRequest) {
  try {
    const body: ProfileRequest = await request.json();
    const { userId, profileData } = body;

    if (!userId) {
      return NextResponse.json<ProfileResponse>(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!profileData || Object.keys(profileData).length === 0) {
      return NextResponse.json<ProfileResponse>(
        { success: false, error: 'profileData is required for update' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json<ProfileResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get existing profile
    const existingProfile = await getProfileByUserId(userId);
    const existingData = existingProfile?.profile_data || {};

    // Merge arrays properly
    const mergedData: ProfileData = { ...existingData };
    
    for (const [key, value] of Object.entries(profileData)) {
      if (Array.isArray(value) && Array.isArray(existingData[key as keyof ProfileData])) {
        // Merge arrays without duplicates
        (mergedData as Record<string, unknown>)[key] = [
          ...new Set([...(existingData[key as keyof ProfileData] as unknown[]), ...value]),
        ];
      } else if (value !== undefined) {
        (mergedData as Record<string, unknown>)[key] = value;
      }
    }

    // Update profile
    const profile = await createOrUpdateProfile(userId, mergedData);

    return NextResponse.json<ProfileResponse>({
      success: true,
      profile: {
        userId: profile.user_id,
        data: profile.profile_data,
        summary: generateProfileSummary(profile.profile_data),
        lastUpdated: profile.last_updated,
      },
    });
  } catch (error) {
    console.error('Profile PATCH error:', error);
    return NextResponse.json<ProfileResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - Remove user profile
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json<ProfileResponse>(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Delete profile
    const deleted = await deleteProfile(userId);

    if (!deleted) {
      return NextResponse.json<ProfileResponse>(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ProfileResponse>({
      success: true,
    });
  } catch (error) {
    console.error('Profile DELETE error:', error);
    return NextResponse.json<ProfileResponse>(
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
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
