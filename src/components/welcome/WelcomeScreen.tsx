'use client';

import { cn } from '@/lib/utils';
import { 
  Plane, 
  MapPin, 
  Compass, 
  Sparkles,
  Globe,
  Settings2,
} from 'lucide-react';

interface WelcomeScreenProps {
  onStartConversation: (prompt: string) => void;
  onPersonalize?: () => void;
  showPersonalizeOption?: boolean;
  className?: string;
}

export function WelcomeScreen({ 
  onStartConversation: _onStartConversation,
  onPersonalize,
  showPersonalizeOption = true,
  className 
}: WelcomeScreenProps) {
  // onStartConversation kept for API compatibility but no longer used
  void _onStartConversation;
  return (
    <div className={cn('flex flex-col items-center justify-center min-h-[60vh] px-4 py-8', className)}>
      {/* Hero Section */}
      <div className="text-center mb-8 animate-fade-in">
        {/* Logo */}
        <div className="relative inline-flex mb-6">
          <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-2xl shadow-teal-500/30">
            <Plane className="size-10 text-white" />
          </div>
          <div className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
            <Sparkles className="size-4 text-white" />
          </div>
        </div>

        {/* Welcome Text */}
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-3">
          Welcome to Atlas
        </h1>
        <p className="text-lg text-zinc-400 max-w-md mx-auto mb-2">
          Your AI-powered travel companion
        </p>
        <p className="text-sm text-zinc-500 max-w-lg mx-auto">
          I&apos;ll help you discover amazing destinations, plan perfect itineraries, 
          and find the best flights, hotels, and activities for your dream trip.
        </p>
      </div>

      {/* Features Row */}
      <div className="flex flex-wrap justify-center gap-4 mb-10 max-w-lg">
        <FeatureBadge icon={<Globe className="size-3.5" />} text="150+ Countries" />
        <FeatureBadge icon={<MapPin className="size-3.5" />} text="Personalized Picks" />
        <FeatureBadge icon={<Compass className="size-3.5" />} text="Local Insights" />
      </div>

      {/* Personalize Option */}
      {showPersonalizeOption && onPersonalize && (
        <div className="w-full max-w-md mb-8">
          <button
            onClick={onPersonalize}
            className={cn(
              'w-full flex items-center justify-center gap-3 p-4 rounded-xl',
              'bg-gradient-to-r from-teal-500/10 to-cyan-500/10',
              'border border-teal-500/30 hover:border-teal-500/50',
              'text-teal-400 hover:text-teal-300',
              'transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/10'
            )}
          >
            <Settings2 className="size-5" />
            <span className="font-medium">Personalize my experience</span>
            <span className="text-xs text-teal-500/70 ml-1">(30 seconds)</span>
          </button>
        </div>
      )}

      {/* Prompt Hint */}
      <div className="mt-8 text-center">
        <p className="text-sm text-zinc-500">
          Start typing below to plan your next adventure ↓
        </p>
      </div>
    </div>
  );
}

function FeatureBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50">
      <span className="text-teal-500">{icon}</span>
      <span className="text-xs text-zinc-400">{text}</span>
    </div>
  );
}

export default WelcomeScreen;
