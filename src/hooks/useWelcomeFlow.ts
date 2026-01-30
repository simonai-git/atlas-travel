'use client';

import { useState, useEffect, useCallback } from 'react';

// Preference types matching QuickPreferences component
type BudgetLevel = 'budget' | 'moderate' | 'luxury';
type TravelStyle = 'solo' | 'couple' | 'family' | 'friends';
type InterestType = 'relaxation' | 'adventure' | 'culture' | 'nightlife';

export interface UserPreferences {
  budget?: BudgetLevel;
  travelStyle?: TravelStyle;
  interests?: InterestType[];
  onboardingCompleted?: boolean;
  completedAt?: string;
}

const STORAGE_KEY = 'atlas_user_preferences';
const ONBOARDING_KEY = 'atlas_onboarding_completed';

export type WelcomeStep = 'welcome' | 'preferences' | 'complete';

interface UseWelcomeFlowReturn {
  // State
  currentStep: WelcomeStep;
  preferences: UserPreferences;
  isNewUser: boolean;
  showPreferences: boolean;
  
  // Actions
  startPreferences: () => void;
  skipPreferences: () => void;
  completePreferences: (prefs: Omit<UserPreferences, 'onboardingCompleted' | 'completedAt'>) => void;
  startConversation: (initialPrompt?: string) => void;
  resetOnboarding: () => void;
  
  // The prompt to send when starting conversation (if any)
  pendingPrompt: string | null;
  clearPendingPrompt: () => void;
}

export function useWelcomeFlow(): UseWelcomeFlowReturn {
  const [currentStep, setCurrentStep] = useState<WelcomeStep>('welcome');
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [isNewUser, setIsNewUser] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  // Load saved preferences and onboarding state on mount
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem(STORAGE_KEY);
      const onboardingDone = localStorage.getItem(ONBOARDING_KEY);
      
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
      
      if (onboardingDone === 'true') {
        setIsNewUser(false);
        setCurrentStep('complete');
      }
    } catch (e) {
      console.warn('Failed to load preferences from localStorage:', e);
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback((prefs: UserPreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.warn('Failed to save preferences to localStorage:', e);
    }
  }, []);

  // Mark onboarding as complete
  const markOnboardingComplete = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (e) {
      console.warn('Failed to save onboarding state:', e);
    }
  }, []);

  // Start the preferences flow
  const startPreferences = useCallback(() => {
    setShowPreferences(true);
    setCurrentStep('preferences');
  }, []);

  // Skip preferences and go straight to conversation
  const skipPreferences = useCallback(() => {
    setShowPreferences(false);
    setCurrentStep('complete');
    markOnboardingComplete();
    setIsNewUser(false);
  }, [markOnboardingComplete]);

  // Complete preferences with user selections
  const completePreferences = useCallback((prefs: Omit<UserPreferences, 'onboardingCompleted' | 'completedAt'>) => {
    const fullPrefs: UserPreferences = {
      ...prefs,
      onboardingCompleted: true,
      completedAt: new Date().toISOString(),
    };
    setPreferences(fullPrefs);
    savePreferences(fullPrefs);
    setShowPreferences(false);
    setCurrentStep('complete');
    markOnboardingComplete();
    setIsNewUser(false);
  }, [savePreferences, markOnboardingComplete]);

  // Start conversation (optionally with a starter prompt)
  const startConversation = useCallback((initialPrompt?: string) => {
    if (initialPrompt) {
      setPendingPrompt(initialPrompt);
    }
    setCurrentStep('complete');
    markOnboardingComplete();
    setIsNewUser(false);
  }, [markOnboardingComplete]);

  // Clear the pending prompt after it's used
  const clearPendingPrompt = useCallback(() => {
    setPendingPrompt(null);
  }, []);

  // Reset onboarding (for testing/debugging)
  const resetOnboarding = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ONBOARDING_KEY);
      setPreferences({});
      setIsNewUser(true);
      setCurrentStep('welcome');
      setShowPreferences(false);
    } catch (e) {
      console.warn('Failed to reset onboarding:', e);
    }
  }, []);

  return {
    currentStep,
    preferences,
    isNewUser,
    showPreferences,
    startPreferences,
    skipPreferences,
    completePreferences,
    startConversation,
    resetOnboarding,
    pendingPrompt,
    clearPendingPrompt,
  };
}

// Helper to format preferences into a context string for the AI
export function formatPreferencesContext(prefs: UserPreferences): string {
  const parts: string[] = [];
  
  if (prefs.budget) {
    const budgetLabels = {
      budget: 'budget-friendly options',
      moderate: 'mid-range options with good value',
      luxury: 'premium and luxury experiences',
    };
    parts.push(`They prefer ${budgetLabels[prefs.budget]}`);
  }
  
  if (prefs.travelStyle) {
    const styleLabels = {
      solo: 'traveling solo',
      couple: 'traveling as a couple',
      family: 'traveling with family',
      friends: 'traveling with friends',
    };
    parts.push(`they typically enjoy ${styleLabels[prefs.travelStyle]}`);
  }
  
  if (prefs.interests && prefs.interests.length > 0) {
    const interestLabels = {
      relaxation: 'relaxation',
      adventure: 'adventure activities',
      culture: 'cultural experiences',
      nightlife: 'nightlife and entertainment',
    };
    const formattedInterests = prefs.interests.map(i => interestLabels[i]).join(', ');
    parts.push(`they're interested in ${formattedInterests}`);
  }
  
  if (parts.length === 0) return '';
  
  return `User preferences: ${parts.join('; ')}.`;
}

export default useWelcomeFlow;
