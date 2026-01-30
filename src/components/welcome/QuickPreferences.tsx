'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Wallet, 
  DollarSign, 
  Gem,
  Users,
  User,
  Heart,
  UserPlus,
  Sparkles,
  Palmtree,
  Mountain,
  Building2,
  PartyPopper,
  ChevronRight,
  X,
} from 'lucide-react';

type BudgetLevel = 'budget' | 'moderate' | 'luxury';
type TravelStyle = 'solo' | 'couple' | 'family' | 'friends';
type InterestType = 'relaxation' | 'adventure' | 'culture' | 'nightlife';

interface QuickPreferencesProps {
  onComplete: (preferences: {
    budget?: BudgetLevel;
    travelStyle?: TravelStyle;
    interests?: InterestType[];
  }) => void;
  onSkip: () => void;
  className?: string;
}

export function QuickPreferences({ onComplete, onSkip, className }: QuickPreferencesProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [budget, setBudget] = useState<BudgetLevel | null>(null);
  const [travelStyle, setTravelStyle] = useState<TravelStyle | null>(null);
  const [interests, setInterests] = useState<InterestType[]>([]);

  const toggleInterest = (interest: InterestType) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleNext = () => {
    if (step < 3) {
      setStep((step + 1) as 2 | 3);
    } else {
      onComplete({
        budget: budget || undefined,
        travelStyle: travelStyle || undefined,
        interests: interests.length > 0 ? interests : undefined,
      });
    }
  };

  const canProceed = () => {
    if (step === 1) return budget !== null;
    if (step === 2) return travelStyle !== null;
    if (step === 3) return interests.length > 0;
    return false;
  };

  return (
    <div className={cn('max-w-md mx-auto px-4 py-8', className)}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="size-5 text-amber-400" />
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
            Quick Setup
          </span>
        </div>
        <p className="text-sm text-zinc-400">
          Help me personalize your experience (optional)
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              'size-2 rounded-full transition-colors',
              s === step ? 'bg-teal-500' : s < step ? 'bg-teal-500/50' : 'bg-zinc-700'
            )}
          />
        ))}
      </div>

      {/* Step 1: Budget */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-lg font-medium text-zinc-200 text-center">
            What&apos;s your typical travel budget?
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <BudgetOption
              icon={<Wallet className="size-5" />}
              label="Budget"
              description="Best value"
              selected={budget === 'budget'}
              onClick={() => setBudget('budget')}
            />
            <BudgetOption
              icon={<DollarSign className="size-5" />}
              label="Moderate"
              description="Balanced"
              selected={budget === 'moderate'}
              onClick={() => setBudget('moderate')}
            />
            <BudgetOption
              icon={<Gem className="size-5" />}
              label="Luxury"
              description="Premium"
              selected={budget === 'luxury'}
              onClick={() => setBudget('luxury')}
            />
          </div>
        </div>
      )}

      {/* Step 2: Travel Style */}
      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-lg font-medium text-zinc-200 text-center">
            How do you usually travel?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StyleOption
              icon={<User className="size-5" />}
              label="Solo"
              selected={travelStyle === 'solo'}
              onClick={() => setTravelStyle('solo')}
            />
            <StyleOption
              icon={<Heart className="size-5" />}
              label="Couple"
              selected={travelStyle === 'couple'}
              onClick={() => setTravelStyle('couple')}
            />
            <StyleOption
              icon={<Users className="size-5" />}
              label="Family"
              selected={travelStyle === 'family'}
              onClick={() => setTravelStyle('family')}
            />
            <StyleOption
              icon={<UserPlus className="size-5" />}
              label="Friends"
              selected={travelStyle === 'friends'}
              onClick={() => setTravelStyle('friends')}
            />
          </div>
        </div>
      )}

      {/* Step 3: Interests */}
      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-lg font-medium text-zinc-200 text-center">
            What draws you to travel?
          </h3>
          <p className="text-xs text-zinc-500 text-center">Select all that apply</p>
          <div className="grid grid-cols-2 gap-3">
            <InterestOption
              icon={<Palmtree className="size-5" />}
              label="Relaxation"
              selected={interests.includes('relaxation')}
              onClick={() => toggleInterest('relaxation')}
            />
            <InterestOption
              icon={<Mountain className="size-5" />}
              label="Adventure"
              selected={interests.includes('adventure')}
              onClick={() => toggleInterest('adventure')}
            />
            <InterestOption
              icon={<Building2 className="size-5" />}
              label="Culture"
              selected={interests.includes('culture')}
              onClick={() => toggleInterest('culture')}
            />
            <InterestOption
              icon={<PartyPopper className="size-5" />}
              label="Nightlife"
              selected={interests.includes('nightlife')}
              onClick={() => toggleInterest('nightlife')}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="text-zinc-500 hover:text-zinc-300"
        >
          <X className="size-4 mr-1" />
          Skip
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="bg-teal-600 hover:bg-teal-500 text-white"
        >
          {step === 3 ? 'Get Started' : 'Next'}
          <ChevronRight className="size-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

function BudgetOption({
  icon,
  label,
  description,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
        selected
          ? 'bg-teal-500/10 border-teal-500 text-teal-400'
          : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-600'
      )}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs opacity-60">{description}</span>
    </button>
  );
}

function StyleOption({
  icon,
  label,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-4 rounded-xl border transition-all',
        selected
          ? 'bg-teal-500/10 border-teal-500 text-teal-400'
          : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-600'
      )}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function InterestOption({
  icon,
  label,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-4 rounded-xl border transition-all',
        selected
          ? 'bg-teal-500/10 border-teal-500 text-teal-400'
          : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-600'
      )}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

export default QuickPreferences;
