/**
 * Tests for Preference Extraction Module
 */

import { describe, it, expect } from 'vitest';
import {
  extractPreferencesFromMessage,
  extractPreferencesFromConversation,
  extractedToProfileData,
  mergeIntoProfile,
  generateProfileSummary,
} from './preference-extractor';
import type { ProfileData } from '@/lib/db/schema';

describe('extractPreferencesFromMessage', () => {
  describe('budget extraction', () => {
    it('should extract explicit budget amounts', () => {
      const result = extractPreferencesFromMessage('My budget is around $200 per day');
      expect(result.budget?.dailyAmount).toBe(200);
      expect(result.budget?.level).toBe('mid-range');
    });

    it('should extract budget level keywords', () => {
      const result = extractPreferencesFromMessage("We're looking for luxury hotels");
      expect(result.budget?.level).toBe('luxury');
      expect(result.travelStyle).toBe('luxury');
    });

    it('should recognize budget travelers', () => {
      const result = extractPreferencesFromMessage("I'm a budget traveler");
      expect(result.budget?.level).toBe('budget');
      expect(result.travelStyle).toBe('budget');
    });

    it('should extract per night pricing', () => {
      const result = extractPreferencesFromMessage('Looking for something around $150/night');
      expect(result.budget?.dailyAmount).toBe(150);
    });
  });

  describe('family/group extraction', () => {
    it('should extract family size', () => {
      const result = extractPreferencesFromMessage('We are a family of 4');
      expect(result.familySize).toBe(4);
      expect(result.travelCompanions?.type).toBe('family');
    });

    it('should extract number of children', () => {
      const result = extractPreferencesFromMessage('Traveling with 2 kids');
      expect(result.travelCompanions?.children).toBe(2);
      expect(result.travelCompanions?.type).toBe('family');
    });

    it('should extract child ages', () => {
      const result = extractPreferencesFromMessage('Our kids are ages 5 and 8');
      expect(result.travelCompanions?.childAges).toEqual([5, 8]);
    });

    it('should recognize solo travelers', () => {
      const result = extractPreferencesFromMessage("I'm traveling solo");
      expect(result.travelCompanions?.type).toBe('solo');
      expect(result.familySize).toBe(1);
    });

    it('should recognize couples', () => {
      const result = extractPreferencesFromMessage('My wife and I are planning a trip');
      expect(result.travelCompanions?.type).toBe('couple');
      expect(result.travelCompanions?.adults).toBe(2);
    });

    it('should extract group size', () => {
      const result = extractPreferencesFromMessage('Planning a trip for a group of 6');
      expect(result.travelCompanions?.type).toBe('group');
      expect(result.familySize).toBe(6);
    });
  });

  describe('dietary restrictions extraction', () => {
    it('should extract vegetarian diet', () => {
      const result = extractPreferencesFromMessage("I'm vegetarian");
      expect(result.dietaryRestrictions).toContain('vegetarian');
    });

    it('should extract vegan diet', () => {
      const result = extractPreferencesFromMessage("We're vegan");
      expect(result.dietaryRestrictions).toContain('vegan');
    });

    it('should extract food allergies', () => {
      const result = extractPreferencesFromMessage("I'm allergic to shellfish");
      expect(result.dietaryRestrictions?.some(d => d.toLowerCase().includes('shellfish'))).toBe(true);
    });

    it('should extract food avoidances', () => {
      const result = extractPreferencesFromMessage("I don't eat pork");
      expect(result.dietaryRestrictions).toContain('no pork');
    });
  });

  describe('interest extraction', () => {
    it('should extract hiking interest', () => {
      const result = extractPreferencesFromMessage('I love hiking and being outdoors');
      expect(result.interests).toContain('hiking');
    });

    it('should extract multiple interests', () => {
      const result = extractPreferencesFromMessage('We enjoy museums and food tours');
      expect(result.interests).toContain('museums');
      expect(result.interests).toContain('food');
    });

    it('should extract cultural interests', () => {
      const result = extractPreferencesFromMessage("I'm really into history and architecture");
      expect(result.interests).toContain('history');
      expect(result.interests).toContain('architecture');
    });
  });

  describe('airport extraction', () => {
    it('should extract 3-letter airport code', () => {
      const result = extractPreferencesFromMessage("I'll be flying out of SFO");
      expect(result.homeAirport).toBe('SFO');
    });

    it('should extract home airport mention', () => {
      const result = extractPreferencesFromMessage('My home airport is LAX');
      expect(result.homeAirport).toBe('LAX');
    });
  });

  describe('airline preference extraction', () => {
    it('should extract preferred airline', () => {
      const result = extractPreferencesFromMessage('I prefer flying United');
      expect(result.preferredAirlines).toContain('United');
    });

    it('should extract airline loyalty', () => {
      const result = extractPreferencesFromMessage("I'm loyal to Delta");
      expect(result.preferredAirlines).toContain('Delta');
    });
  });

  describe('currency preference extraction', () => {
    it('should extract USD preference', () => {
      const result = extractPreferencesFromMessage('Can you show prices in USD?');
      expect(result.preferredCurrency).toBe('USD');
    });

    it('should extract Euro preference', () => {
      const result = extractPreferencesFromMessage('I prefer prices in euros');
      expect(result.preferredCurrency).toBe('EUR');
    });
  });
});

describe('extractPreferencesFromConversation', () => {
  it('should combine preferences from multiple messages', () => {
    const messages = [
      { role: 'user', content: "We're a family of 4 with 2 kids" },
      { role: 'assistant', content: 'Great! What is your budget?' },
      { role: 'user', content: 'Around $200 per day' },
      { role: 'assistant', content: 'Any dietary restrictions?' },
      { role: 'user', content: "We're vegetarian" },
    ];

    const result = extractPreferencesFromConversation(messages);

    expect(result.familySize).toBe(4);
    expect(result.travelCompanions?.children).toBe(2);
    expect(result.budget?.dailyAmount).toBe(200);
    expect(result.dietaryRestrictions).toContain('vegetarian');
  });

  it('should only analyze user messages', () => {
    const messages = [
      { role: 'user', content: 'Planning a luxury trip' },
      { role: 'assistant', content: 'I recommend budget options in Paris' },
    ];

    const result = extractPreferencesFromConversation(messages);

    expect(result.travelStyle).toBe('luxury');
    // Should not pick up 'budget' from assistant message
  });

  it('should increase confidence with more messages', () => {
    const fewMessages = [{ role: 'user', content: "I'm vegetarian" }];
    const manyMessages = [
      { role: 'user', content: "I'm vegetarian" },
      { role: 'user', content: 'Budget around $100/day' },
      { role: 'user', content: 'Traveling solo' },
      { role: 'user', content: 'I love hiking' },
    ];

    const resultFew = extractPreferencesFromConversation(fewMessages);
    const resultMany = extractPreferencesFromConversation(manyMessages);

    expect(resultMany.confidence).toBeGreaterThan(resultFew.confidence);
  });
});

describe('extractedToProfileData', () => {
  it('should convert extracted preferences to ProfileData format', () => {
    const extracted = {
      travelStyle: 'luxury' as const,
      homeAirport: 'SFO',
      interests: ['hiking', 'food'],
      dietaryRestrictions: ['vegetarian'],
      budget: {
        level: 'luxury' as const,
        dailyAmount: 500,
        currency: 'USD',
      },
      travelCompanions: {
        type: 'couple' as const,
        adults: 2,
      },
      confidence: 0.8,
    };

    const profileData = extractedToProfileData(extracted);

    expect(profileData.travel_style).toBe('luxury');
    expect(profileData.home_airport).toBe('SFO');
    expect(profileData.interests).toEqual(['hiking', 'food']);
    expect(profileData.dietary_restrictions).toEqual(['vegetarian']);
    expect(profileData.budget?.level).toBe('luxury');
    expect(profileData.budget?.daily_amount).toBe(500);
    expect(profileData.family_info?.travel_type).toBe('couple');
    expect(profileData.family_info?.adults).toBe(2);
  });
});

describe('mergeIntoProfile', () => {
  it('should merge new preferences into existing profile', () => {
    const existingProfile: ProfileData = {
      travel_style: 'mid-range',
      interests: ['museums'],
      home_airport: 'LAX',
    };

    const extracted = {
      interests: ['hiking'],
      dietaryRestrictions: ['vegetarian'],
      confidence: 0.5,
    };

    const merged = mergeIntoProfile(existingProfile, extracted);

    expect(merged.travel_style).toBe('mid-range'); // Preserved
    expect(merged.home_airport).toBe('LAX'); // Preserved
    expect(merged.interests).toContain('museums'); // Preserved
    expect(merged.interests).toContain('hiking'); // Added
    expect(merged.dietary_restrictions).toContain('vegetarian'); // Added
  });

  it('should override simple values when extracted', () => {
    const existingProfile: ProfileData = {
      travel_style: 'budget',
    };

    const extracted = {
      travelStyle: 'luxury' as const,
      confidence: 0.5,
    };

    const merged = mergeIntoProfile(existingProfile, extracted);

    expect(merged.travel_style).toBe('luxury');
  });

  it('should handle null existing profile', () => {
    const extracted = {
      travelStyle: 'luxury' as const,
      interests: ['hiking'],
      confidence: 0.5,
    };

    const merged = mergeIntoProfile(null, extracted);

    expect(merged.travel_style).toBe('luxury');
    expect(merged.interests).toContain('hiking');
  });
});

describe('generateProfileSummary', () => {
  it('should generate readable summary from profile', () => {
    const profile: ProfileData = {
      travel_style: 'luxury',
      home_airport: 'SFO',
      interests: ['hiking', 'food'],
      dietary_restrictions: ['vegetarian'],
      budget: {
        level: 'luxury',
        daily_amount: 500,
        currency: 'USD',
      },
      family_info: {
        travel_type: 'couple',
        adults: 2,
      },
    };

    const summary = generateProfileSummary(profile);

    expect(summary).toContain('luxury');
    expect(summary).toContain('SFO');
    expect(summary).toContain('hiking');
    expect(summary).toContain('vegetarian');
    expect(summary).toContain('500');
    expect(summary).toContain('couple');
  });

  it('should return placeholder for empty profile', () => {
    const summary = generateProfileSummary({});
    expect(summary).toBe('No preferences saved yet.');
  });

  it('should format family with children correctly', () => {
    const profile: ProfileData = {
      family_info: {
        travel_type: 'family',
        adults: 2,
        children: 2,
        child_ages: [5, 8],
      },
    };

    const summary = generateProfileSummary(profile);

    expect(summary).toContain('family');
    expect(summary).toContain('2 children');
    expect(summary).toContain('5');
    expect(summary).toContain('8');
  });
});
