import { NextRequest, NextResponse } from 'next/server';
import {
  getConversationsByUserId,
  createConversation,
  getOrCreateUser,
} from '@/lib/db/schema';

// Default user for demo (in production, this would come from auth)
const DEMO_USER_EMAIL = 'demo@atlas-travel.com';

// GET /api/conversations - List all conversations
export async function GET(request: NextRequest) {
  // Check if database is configured
  if (!process.env.DATABASE_URL) {
    // Return empty list for development without database
    return NextResponse.json({ conversations: [] });
  }
  
  try {
    // Get or create demo user
    const user = await getOrCreateUser(DEMO_USER_EMAIL);
    
    // Get query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    
    const conversations = await getConversationsByUserId(user.id, limit, offset);
    
    return NextResponse.json({
      conversations: conversations.map((conv) => ({
        id: conv.id,
        title: conv.title,
        createdAt: conv.created_at,
        updatedAt: conv.updated_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title } = body;
    
    // Get or create demo user
    const user = await getOrCreateUser(DEMO_USER_EMAIL);
    
    const conversation = await createConversation(
      user.id,
      title || 'New Conversation'
    );
    
    return NextResponse.json({
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at,
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
