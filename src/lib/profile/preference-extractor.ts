/**
 * Preference Extraction Module
 * 
 * Automatically extracts user preferences from conversation messages
 * to build and update user profiles over time.
 */

import type { ProfileData } from '@/lib/db/schema';

// ============================================================================
// Types
// ============================================================================

export interface ExtractedPreferences {
  budget?: {
    level: 'budget' | 'mid-range' | 'luxury';
    dailyAmount?: number;
    currency?: string;
  };
  travelStyle?: 'budget' | 'mid-range' | 'luxury';
  familySize?: number;
  travelCompanions?: {
    type: 'solo' | 'couple' | 'family' | 'group';
    adults?: number;
    children?: number;
    childAges?: number[];
  };
  dietaryRestrictions?: string[];
  accessibilityNeeds?: string[];
  interests?: string[];
  homeAirport?: string;
  preferredCurrency?: string;
  preferredAirlines?: string[];
  avoidedDestinations?: string[];
  confidence: number; // 0-1 score indicating extraction confidence
}

interface ExtractionPattern {
  pattern: RegExp;
  extract: (match: RegExpMatchArray, text: string) => Partial<ExtractedPreferences>;
}

// ============================================================================
// Extraction Patterns
// ============================================================================

const BUDGET_PATTERNS: ExtractionPattern[] = [
  // Explicit budget mentions
  {
    pattern: /(?:budget|spend|spending)(?:\s+(?:is|of|around|about))?\s*(?:\$|USD|EUR|€|£)?(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    extract: (match) => {
      const amount = parseFloat(match[1].replace(',', ''));
      return {
        budget: {
          level: amount < 100 ? 'budget' : amount < 300 ? 'mid-range' : 'luxury',
          dailyAmount: amount,
          currency: 'USD',
        },
      };
    },
  },
  // Budget level mentions
  {
    pattern: /(?:we(?:'re|'?re| are)|i(?:'m|'?m| am)|looking for|prefer|want)\s+(?:a\s+)?(?:more\s+)?(budget|cheap|affordable|inexpensive|low[- ]cost)/i,
    extract: () => ({
      budget: { level: 'budget' },
      travelStyle: 'budget',
    }),
  },
  {
    pattern: /(?:we(?:'re|'?re| are)|i(?:'m|'?m| am)|looking for|prefer|want)\s+(?:a\s+)?(?:more\s+)?(luxury|luxurious|high[- ]end|premium|upscale|5[- ]star)/i,
    extract: () => ({
      budget: { level: 'luxury' },
      travelStyle: 'luxury',
    }),
  },
  {
    pattern: /(?:we(?:'re|'?re| are)|i(?:'m|'?m| am)|looking for|prefer|want)\s+(?:a\s+)?(?:more\s+)?(mid[- ]?range|moderate|reasonable)/i,
    extract: () => ({
      budget: { level: 'mid-range' },
      travelStyle: 'mid-range',
    }),
  },
  // Planning a luxury/budget trip
  {
    pattern: /(?:planning|plan|going on|taking)\s+(?:a\s+)?(luxury|luxurious|high[- ]end|premium|upscale)\s+(?:trip|vacation|holiday|getaway)/i,
    extract: () => ({
      budget: { level: 'luxury' },
      travelStyle: 'luxury',
    }),
  },
  {
    pattern: /(?:planning|plan|going on|taking)\s+(?:a\s+)?(budget|cheap|affordable|low[- ]cost)\s+(?:trip|vacation|holiday|getaway)/i,
    extract: () => ({
      budget: { level: 'budget' },
      travelStyle: 'budget',
    }),
  },
  // Per night/day budget
  {
    pattern: /(?:\$|USD|EUR|€|£)?(\d+(?:,\d{3})*)\s*(?:per|a|\/)\s*(?:night|day)/i,
    extract: (match) => {
      const amount = parseFloat(match[1].replace(',', ''));
      return {
        budget: {
          level: amount < 100 ? 'budget' : amount < 300 ? 'mid-range' : 'luxury',
          dailyAmount: amount,
          currency: 'USD',
        },
      };
    },
  },
];

const FAMILY_PATTERNS: ExtractionPattern[] = [
  // Family with children
  {
    pattern: /(?:family\s+of|traveling\s+with)\s*(\d+)/i,
    extract: (match) => ({
      familySize: parseInt(match[1], 10),
      travelCompanions: { type: 'family' },
    }),
  },
  {
    pattern: /(\d+)\s*(?:kids?|children)/i,
    extract: (match) => ({
      travelCompanions: {
        type: 'family',
        children: parseInt(match[1], 10),
      },
    }),
  },
  // Adults count
  {
    pattern: /(\d+)\s*adults?/i,
    extract: (match) => ({
      travelCompanions: {
        type: match[1] === '1' ? 'solo' : match[1] === '2' ? 'couple' : 'group',
        adults: parseInt(match[1], 10),
      },
    }),
  },
  // Child ages
  {
    pattern: /(?:kids?|children)\s*(?:are\s*)?(?:ages?\s*)?(\d+)(?:\s*(?:and|,|&)\s*(\d+))?(?:\s*(?:and|,|&)\s*(\d+))?/i,
    extract: (match) => {
      const ages = [match[1], match[2], match[3]]
        .filter(Boolean)
        .map((a) => parseInt(a, 10));
      return {
        travelCompanions: {
          type: 'family',
          children: ages.length,
          childAges: ages,
        },
      };
    },
  },
  // Solo/couple/group
  {
    pattern: /(?:traveling|going|trip)\s*(?:solo|alone|by myself)/i,
    extract: () => ({
      travelCompanions: { type: 'solo', adults: 1 },
      familySize: 1,
    }),
  },
  {
    pattern: /(?:my\s+(?:wife|husband|partner|spouse)\s+and\s+(?:I|me)|(?:I|me)\s+and\s+my\s+(?:wife|husband|partner|spouse)|(?:we(?:'re|'?re| are)\s+a\s+)?couple)/i,
    extract: () => ({
      travelCompanions: { type: 'couple', adults: 2 },
      familySize: 2,
    }),
  },
  {
    pattern: /group\s+of\s+(\d+)/i,
    extract: (match) => ({
      travelCompanions: { type: 'group', adults: parseInt(match[1], 10) },
      familySize: parseInt(match[1], 10),
    }),
  },
];

const DIETARY_PATTERNS: ExtractionPattern[] = [
  {
    pattern: /(?:i(?:'m|'?m| am)|we(?:'re|'?re| are)|i'm|we're)\s*(vegetarian|vegan|pescatarian|gluten[- ]free|kosher|halal|dairy[- ]free|lactose[- ]intolerant)/i,
    extract: (match) => ({
      dietaryRestrictions: [match[1].toLowerCase()],
    }),
  },
  {
    pattern: /allergic\s+to\s+(shellfish|seafood|nuts|peanuts|dairy|gluten|eggs|soy|fish)/i,
    extract: (match) => ({
      dietaryRestrictions: [`allergic to ${match[1].toLowerCase()}`],
    }),
  },
  {
    pattern: /(?:have\s+)?(?:a\s+)?(nut|peanut|shellfish|seafood)\s+allergy/i,
    extract: (match) => ({
      dietaryRestrictions: [`${match[1].toLowerCase()} allergy`],
    }),
  },
  {
    pattern: /(?:don't|do not|cannot|can't)\s+eat\s+(meat|pork|beef|shellfish|nuts|dairy|gluten)/i,
    extract: (match) => ({
      dietaryRestrictions: [`no ${match[1].toLowerCase()}`],
    }),
  },
];

const INTEREST_PATTERNS: ExtractionPattern[] = [
  {
    pattern: /(?:love|enjoy|interested in|into|passionate about|like)\s+(hiking|museums|art|food|beaches|adventure|history|culture|nightlife|shopping|nature|photography|architecture|wine|sports)/i,
    extract: (match) => ({
      interests: [match[1].toLowerCase()],
    }),
  },
];

const AIRPORT_PATTERNS: ExtractionPattern[] = [
  {
    pattern: /(?:fly(?:ing)?\s+(?:out\s+)?(?:of|from)|home\s+airport(?:\s+is)?|based\s+(?:in|out\s+of)|departing\s+from)\s+([A-Z]{3}|[A-Za-z\s]+(?:airport|international)?)/i,
    extract: (match) => ({
      homeAirport: match[1].toUpperCase().trim(),
    }),
  },
];

const CURRENCY_PATTERNS: ExtractionPattern[] = [
  {
    pattern: /(?:prices?\s+in|prefer|use)\s+(USD|EUR|GBP|JPY|CAD|AUD|dollars?|euros?|pounds?|yen)/i,
    extract: (match) => {
      const currencyMap: Record<string, string> = {
        usd: 'USD', dollar: 'USD', dollars: 'USD',
        eur: 'EUR', euro: 'EUR', euros: 'EUR',
        gbp: 'GBP', pound: 'GBP', pounds: 'GBP',
        jpy: 'JPY', yen: 'JPY',
        cad: 'CAD', aud: 'AUD',
      };
      const currency = currencyMap[match[1].toLowerCase()] || match[1].toUpperCase();
      return { preferredCurrency: currency };
    },
  },
];

const AIRLINE_PATTERNS: ExtractionPattern[] = [
  {
    pattern: /(?:prefer|like|fly(?:ing)?(?:\s+with)?|loyal\s+to|member\s+of)\s+(United|Delta|American|Southwest|JetBlue|Alaska|Spirit|Frontier|Hawaiian|Emirates|Lufthansa|British Airways|Air France|KLM|Singapore Airlines|ANA|JAL|Qantas)/i,
    extract: (match) => ({
      preferredAirlines: [match[1]],
    }),
  },
];

const AVOID_PATTERNS: ExtractionPattern[] = [
  {
    pattern: /(?:avoid|don't want to go to|not interested in|skip)\s+([A-Za-z\s]+?)(?:\.|,|$)/i,
    extract: (match) => ({
      avoidedDestinations: [match[1].trim()],
    }),
  },
];

// ============================================================================
// Main Extraction Function
// ============================================================================

/**
 * Extract preferences from a single message
 */
export function extractPreferencesFromMessage(message: string): ExtractedPreferences {
  const preferences: ExtractedPreferences = { confidence: 0 };
  let matchCount = 0;

  const allPatterns = [
    ...BUDGET_PATTERNS,
    ...FAMILY_PATTERNS,
    ...DIETARY_PATTERNS,
    ...INTEREST_PATTERNS,
    ...AIRPORT_PATTERNS,
    ...CURRENCY_PATTERNS,
    ...AIRLINE_PATTERNS,
    ...AVOID_PATTERNS,
  ];

  for (const { pattern, extract } of allPatterns) {
    const match = message.match(pattern);
    if (match) {
      const extracted = extract(match, message);
      mergePreferences(preferences, extracted);
      matchCount++;
    }
  }

  // Handle interests separately to capture multiple mentions
  const interestRegex = /(?:love|enjoy|interested in|into|passionate about|like)\s+(hiking|museums|art|food|beaches|adventure|history|culture|nightlife|shopping|nature|photography|architecture|wine|sports)/gi;
  let interestMatch;
  while ((interestMatch = interestRegex.exec(message)) !== null) {
    if (interestMatch[1]) {
      if (!preferences.interests) {
        preferences.interests = [];
      }
      const interest = interestMatch[1].toLowerCase();
      if (!preferences.interests.includes(interest)) {
        preferences.interests.push(interest);
        matchCount++;
      }
    }
  }
  
  // Also check for "X and Y" pattern after interest verbs
  const andPattern = /(?:love|enjoy|interested in|into|passionate about|like)\s+(\w+)\s+and\s+(hiking|museums|art|food|beaches|adventure|history|culture|nightlife|shopping|nature|photography|architecture|wine|sports)/gi;
  let andMatch;
  while ((andMatch = andPattern.exec(message)) !== null) {
    if (andMatch[2]) {
      if (!preferences.interests) {
        preferences.interests = [];
      }
      const interest = andMatch[2].toLowerCase();
      if (!preferences.interests.includes(interest)) {
        preferences.interests.push(interest);
      }
    }
  }

  // Calculate confidence based on number of matches and specificity
  preferences.confidence = Math.min(1, matchCount * 0.2);

  return preferences;
}

/**
 * Extract preferences from multiple messages
 */
export function extractPreferencesFromConversation(
  messages: Array<{ role: string; content: string }>
): ExtractedPreferences {
  const allPreferences: ExtractedPreferences = { confidence: 0 };

  // Only analyze user messages
  const userMessages = messages.filter((m) => m.role === 'user');

  for (const message of userMessages) {
    const extracted = extractPreferencesFromMessage(message.content);
    mergePreferences(allPreferences, extracted);
  }

  // Higher confidence with more messages analyzed
  allPreferences.confidence = Math.min(1, allPreferences.confidence + userMessages.length * 0.05);

  return allPreferences;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Merge extracted preferences into target
 */
function mergePreferences(
  target: ExtractedPreferences,
  source: Partial<ExtractedPreferences>
): void {
  // Budget
  if (source.budget) {
    target.budget = { ...target.budget, ...source.budget };
  }

  // Travel style
  if (source.travelStyle) {
    target.travelStyle = source.travelStyle;
  }

  // Family size
  if (source.familySize) {
    target.familySize = source.familySize;
  }

  // Travel companions
  if (source.travelCompanions) {
    target.travelCompanions = {
      ...target.travelCompanions,
      ...source.travelCompanions,
    };
  }

  // Arrays - merge without duplicates
  if (source.dietaryRestrictions) {
    target.dietaryRestrictions = [
      ...new Set([...(target.dietaryRestrictions || []), ...source.dietaryRestrictions]),
    ];
  }

  if (source.accessibilityNeeds) {
    target.accessibilityNeeds = [
      ...new Set([...(target.accessibilityNeeds || []), ...source.accessibilityNeeds]),
    ];
  }

  if (source.interests) {
    target.interests = [...new Set([...(target.interests || []), ...source.interests])];
  }

  if (source.preferredAirlines) {
    target.preferredAirlines = [
      ...new Set([...(target.preferredAirlines || []), ...source.preferredAirlines]),
    ];
  }

  if (source.avoidedDestinations) {
    target.avoidedDestinations = [
      ...new Set([...(target.avoidedDestinations || []), ...source.avoidedDestinations]),
    ];
  }

  // Simple values
  if (source.homeAirport) target.homeAirport = source.homeAirport;
  if (source.preferredCurrency) target.preferredCurrency = source.preferredCurrency;
}

/**
 * Convert extracted preferences to ProfileData format for storage
 */
export function extractedToProfileData(extracted: ExtractedPreferences): Partial<ProfileData> {
  const profile: Partial<ProfileData> = {};

  if (extracted.travelStyle) {
    profile.travel_style = extracted.travelStyle;
  }

  if (extracted.preferredCurrency) {
    profile.preferred_currency = extracted.preferredCurrency;
  }

  if (extracted.homeAirport) {
    profile.home_airport = extracted.homeAirport;
  }

  if (extracted.preferredAirlines?.length) {
    profile.preferred_airlines = extracted.preferredAirlines;
  }

  if (extracted.dietaryRestrictions?.length) {
    profile.dietary_restrictions = extracted.dietaryRestrictions;
  }

  if (extracted.accessibilityNeeds?.length) {
    profile.accessibility_needs = extracted.accessibilityNeeds;
  }

  if (extracted.interests?.length) {
    profile.interests = extracted.interests;
  }

  if (extracted.avoidedDestinations?.length) {
    profile.avoided_destinations = extracted.avoidedDestinations;
  }

  // Extended budget field
  if (extracted.budget) {
    profile.budget = {
      level: extracted.budget.level,
      daily_amount: extracted.budget.dailyAmount,
      currency: extracted.budget.currency,
    };
  }

  // Extended family info field
  if (extracted.travelCompanions || extracted.familySize) {
    profile.family_info = {
      size: extracted.familySize,
      adults: extracted.travelCompanions?.adults,
      children: extracted.travelCompanions?.children,
      child_ages: extracted.travelCompanions?.childAges,
      travel_type: extracted.travelCompanions?.type,
    };
  }

  return profile;
}

/**
 * Merge extracted preferences into existing profile
 */
export function mergeIntoProfile(
  existingProfile: ProfileData | null,
  extracted: ExtractedPreferences
): ProfileData {
  const newData = extractedToProfileData(extracted);
  const existing = existingProfile || {};

  return {
    ...existing,
    ...newData,
    // Merge arrays properly
    preferred_airlines: [
      ...new Set([...(existing.preferred_airlines || []), ...(newData.preferred_airlines || [])]),
    ],
    dietary_restrictions: [
      ...new Set([...(existing.dietary_restrictions || []), ...(newData.dietary_restrictions || [])]),
    ],
    accessibility_needs: [
      ...new Set([...(existing.accessibility_needs || []), ...(newData.accessibility_needs || [])]),
    ],
    interests: [...new Set([...(existing.interests || []), ...(newData.interests || [])])],
    avoided_destinations: [
      ...new Set([...(existing.avoided_destinations || []), ...(newData.avoided_destinations || [])]),
    ],
  };
}

/**
 * Generate a human-readable profile summary
 */
export function generateProfileSummary(profile: ProfileData): string {
  const lines: string[] = [];

  if (profile.travel_style) {
    lines.push(`Travel style: ${profile.travel_style}`);
  }

  // Budget info
  if (profile.budget) {
    if (profile.budget.daily_amount && profile.budget.currency) {
      lines.push(`Budget: ~${profile.budget.currency}${profile.budget.daily_amount}/day (${profile.budget.level || 'unspecified'})`);
    } else if (profile.budget.level) {
      lines.push(`Budget level: ${profile.budget.level}`);
    }
  }

  // Family/group info
  if (profile.family_info) {
    const parts: string[] = [];
    if (profile.family_info.travel_type) {
      parts.push(profile.family_info.travel_type);
    }
    if (profile.family_info.size) {
      parts.push(`${profile.family_info.size} people`);
    } else {
      if (profile.family_info.adults) {
        parts.push(`${profile.family_info.adults} adult${profile.family_info.adults > 1 ? 's' : ''}`);
      }
      if (profile.family_info.children) {
        const childStr = `${profile.family_info.children} child${profile.family_info.children > 1 ? 'ren' : ''}`;
        if (profile.family_info.child_ages?.length) {
          parts.push(`${childStr} (ages ${profile.family_info.child_ages.join(', ')})`);
        } else {
          parts.push(childStr);
        }
      }
    }
    if (parts.length > 0) {
      lines.push(`Traveling: ${parts.join(', ')}`);
    }
  }

  if (profile.home_airport) {
    lines.push(`Home airport: ${profile.home_airport}`);
  }

  if (profile.preferred_currency) {
    lines.push(`Preferred currency: ${profile.preferred_currency}`);
  }

  if (profile.preferred_airlines?.length) {
    lines.push(`Preferred airlines: ${profile.preferred_airlines.join(', ')}`);
  }

  if (profile.preferred_hotel_chains?.length) {
    lines.push(`Preferred hotels: ${profile.preferred_hotel_chains.join(', ')}`);
  }

  if (profile.interests?.length) {
    lines.push(`Interests: ${profile.interests.join(', ')}`);
  }

  if (profile.dietary_restrictions?.length) {
    lines.push(`Dietary: ${profile.dietary_restrictions.join(', ')}`);
  }

  if (profile.accessibility_needs?.length) {
    lines.push(`Accessibility: ${profile.accessibility_needs.join(', ')}`);
  }

  if (profile.passport_country) {
    lines.push(`Passport: ${profile.passport_country}`);
  }

  if (profile.frequent_flyer_programs?.length) {
    const programs = profile.frequent_flyer_programs.map((p) => p.airline).join(', ');
    lines.push(`Frequent flyer: ${programs}`);
  }

  if (profile.avoided_destinations?.length) {
    lines.push(`Avoiding: ${profile.avoided_destinations.join(', ')}`);
  }

  if (lines.length === 0) {
    return 'No preferences saved yet.';
  }

  return lines.join('\n');
}
