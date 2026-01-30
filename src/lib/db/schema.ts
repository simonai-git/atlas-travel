import { query, getClient } from './index';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface User {
  id: string;
  email: string;
  created_at: Date;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  embedded_content: EmbeddedContent | null;
  created_at: Date;
}

// Embedded content types for travel cards
export interface EmbeddedContent {
  cards?: TravelCard[];
}

export type TravelCard = HotelCard | FlightCard | ActivityCard;

export interface HotelCard {
  type: 'hotel';
  name: string;
  location: string;
  price_per_night: number;
  currency: string;
  rating?: number;
  amenities?: string[];
  image_url?: string;
  booking_url?: string;
  check_in?: string;
  check_out?: string;
}

export interface FlightCard {
  type: 'flight';
  airline: string;
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  currency: string;
  booking_url?: string;
  cabin_class?: string;
}

export interface ActivityCard {
  type: 'activity';
  name: string;
  location: string;
  description?: string;
  price?: number;
  currency?: string;
  duration?: string;
  rating?: number;
  image_url?: string;
  booking_url?: string;
}

export interface UserProfile {
  user_id: string;
  profile_data: ProfileData;
  last_updated: Date;
}

export interface ProfileData {
  preferred_currency?: string;
  preferred_airlines?: string[];
  preferred_hotel_chains?: string[];
  travel_style?: 'budget' | 'mid-range' | 'luxury';
  dietary_restrictions?: string[];
  accessibility_needs?: string[];
  home_airport?: string;
  passport_country?: string;
  frequent_flyer_programs?: { airline: string; number: string }[];
  interests?: string[];
  avoided_destinations?: string[];
}

// ============================================================================
// Schema Initialization
// ============================================================================

const SCHEMA_SQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  embedded_content JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  profile_data JSONB NOT NULL DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for conversations updated_at
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_profiles last_updated
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_profiles_last_updated ON user_profiles;
CREATE TRIGGER update_user_profiles_last_updated
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_last_updated_column();
`;

export async function initializeSchema(): Promise<void> {
  const client = await getClient();
  try {
    await client.query(SCHEMA_SQL);
    console.log('Database schema initialized successfully');
  } finally {
    client.release();
  }
}

// ============================================================================
// User CRUD Operations
// ============================================================================

export async function createUser(email: string): Promise<User> {
  const rows = await query<User>(
    'INSERT INTO users (email) VALUES ($1) RETURNING *',
    [email]
  );
  return rows[0];
}

export async function getUserById(id: string): Promise<User | null> {
  const rows = await query<User>('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const rows = await query<User>('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

export async function getOrCreateUser(email: string): Promise<User> {
  const existing = await getUserByEmail(email);
  if (existing) return existing;
  return createUser(email);
}

export async function deleteUser(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    'DELETE FROM users WHERE id = $1 RETURNING id',
    [id]
  );
  return rows.length > 0;
}

// ============================================================================
// Conversation CRUD Operations
// ============================================================================

export async function createConversation(
  userId: string,
  title: string = 'New Conversation'
): Promise<Conversation> {
  const rows = await query<Conversation>(
    'INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING *',
    [userId, title]
  );
  return rows[0];
}

export async function getConversationById(id: string): Promise<Conversation | null> {
  const rows = await query<Conversation>(
    'SELECT * FROM conversations WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

export async function getConversationsByUserId(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Conversation[]> {
  return query<Conversation>(
    'SELECT * FROM conversations WHERE user_id = $1 ORDER BY updated_at DESC LIMIT $2 OFFSET $3',
    [userId, limit, offset]
  );
}

export async function updateConversationTitle(
  id: string,
  title: string
): Promise<Conversation | null> {
  const rows = await query<Conversation>(
    'UPDATE conversations SET title = $1 WHERE id = $2 RETURNING *',
    [title, id]
  );
  return rows[0] || null;
}

export async function deleteConversation(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    'DELETE FROM conversations WHERE id = $1 RETURNING id',
    [id]
  );
  return rows.length > 0;
}

export async function touchConversation(id: string): Promise<void> {
  await query('UPDATE conversations SET updated_at = NOW() WHERE id = $1', [id]);
}

// ============================================================================
// Message CRUD Operations
// ============================================================================

export async function createMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  embeddedContent?: EmbeddedContent
): Promise<Message> {
  const rows = await query<Message>(
    `INSERT INTO messages (conversation_id, role, content, embedded_content) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [conversationId, role, content, embeddedContent ? JSON.stringify(embeddedContent) : null]
  );
  // Touch the conversation to update its updated_at
  await touchConversation(conversationId);
  return rows[0];
}

export async function getMessageById(id: string): Promise<Message | null> {
  const rows = await query<Message>('SELECT * FROM messages WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function getMessagesByConversationId(
  conversationId: string,
  limit: number = 100,
  offset: number = 0
): Promise<Message[]> {
  return query<Message>(
    'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC LIMIT $2 OFFSET $3',
    [conversationId, limit, offset]
  );
}

export async function getRecentMessages(
  conversationId: string,
  limit: number = 20
): Promise<Message[]> {
  // Get recent messages but return them in chronological order
  const rows = await query<Message>(
    `SELECT * FROM (
      SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT $2
    ) sub ORDER BY created_at ASC`,
    [conversationId, limit]
  );
  return rows;
}

export async function updateMessageContent(
  id: string,
  content: string,
  embeddedContent?: EmbeddedContent
): Promise<Message | null> {
  const rows = await query<Message>(
    'UPDATE messages SET content = $1, embedded_content = $2 WHERE id = $3 RETURNING *',
    [content, embeddedContent ? JSON.stringify(embeddedContent) : null, id]
  );
  return rows[0] || null;
}

export async function deleteMessage(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    'DELETE FROM messages WHERE id = $1 RETURNING id',
    [id]
  );
  return rows.length > 0;
}

export async function countMessagesInConversation(conversationId: string): Promise<number> {
  const rows = await query<{ count: string }>(
    'SELECT COUNT(*) as count FROM messages WHERE conversation_id = $1',
    [conversationId]
  );
  return parseInt(rows[0].count, 10);
}

// ============================================================================
// User Profile CRUD Operations
// ============================================================================

export async function createOrUpdateProfile(
  userId: string,
  profileData: ProfileData
): Promise<UserProfile> {
  const rows = await query<UserProfile>(
    `INSERT INTO user_profiles (user_id, profile_data) VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET profile_data = $2, last_updated = NOW()
     RETURNING *`,
    [userId, JSON.stringify(profileData)]
  );
  return rows[0];
}

export async function getProfileByUserId(userId: string): Promise<UserProfile | null> {
  const rows = await query<UserProfile>(
    'SELECT * FROM user_profiles WHERE user_id = $1',
    [userId]
  );
  return rows[0] || null;
}

export async function updateProfileField<K extends keyof ProfileData>(
  userId: string,
  field: K,
  value: ProfileData[K]
): Promise<UserProfile | null> {
  // Use JSONB set to update a specific field
  const rows = await query<UserProfile>(
    `UPDATE user_profiles 
     SET profile_data = jsonb_set(COALESCE(profile_data, '{}'), $2, $3::jsonb)
     WHERE user_id = $1 RETURNING *`,
    [userId, `{${field}}`, JSON.stringify(value)]
  );
  return rows[0] || null;
}

export async function deleteProfile(userId: string): Promise<boolean> {
  const rows = await query<{ user_id: string }>(
    'DELETE FROM user_profiles WHERE user_id = $1 RETURNING user_id',
    [userId]
  );
  return rows.length > 0;
}

// ============================================================================
// Utility Functions
// ============================================================================

export async function getConversationWithMessages(
  conversationId: string
): Promise<{ conversation: Conversation; messages: Message[] } | null> {
  const conversation = await getConversationById(conversationId);
  if (!conversation) return null;
  
  const messages = await getMessagesByConversationId(conversationId);
  return { conversation, messages };
}

export async function getUserWithProfile(
  userId: string
): Promise<{ user: User; profile: UserProfile | null } | null> {
  const user = await getUserById(userId);
  if (!user) return null;
  
  const profile = await getProfileByUserId(userId);
  return { user, profile };
}

// Export all types and functions
export type { Pool } from 'pg';
