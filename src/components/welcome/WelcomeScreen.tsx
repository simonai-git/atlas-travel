'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Plane, 
  MapPin, 
  Compass, 
  Palmtree, 
  Mountain, 
  Building2, 
  Utensils,
  Sparkles,
  ChevronRight,
  Globe,
  Settings2,
} from 'lucide-react';

interface StarterPrompt {
  id: string;
  icon: React.ReactNode;
  title: string;
  prompt: string;
  gradient: string;
}

const starterPrompts: StarterPrompt[] = [
  {
    id: 'beach',
    icon: <Palmtree className="size-5" />,
    title: 'Beach Getaway',
    prompt: "I'm looking for a relaxing beach vacation with crystal clear water and great snorkeling spots",
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'adventure',
    icon: <Mountain className="size-5" />,
    title: 'Adventure Trip',
    prompt: "I want an adventure-packed trip with hiking, outdoor activities, and stunning natural scenery",
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'city',
    icon: <Building2 className="size-5" />,
    title: 'City Explorer',
    prompt: "I'd like to explore a vibrant city with rich history, museums, and great nightlife",
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    id: 'food',
    icon: <Utensils className="size-5" />,
    title: 'Culinary Journey',
    prompt: "Plan me a food-focused trip where I can experience authentic local cuisine and cooking classes",
    gradient: 'from-orange-500 to-red-600',
  },
];

interface WelcomeScreenProps {
  onStartConversation: (prompt: string) => void;
  onPersonalize?: () => void;
  showPersonalizeOption?: boolean;
  className?: string;
}

export function WelcomeScreen({ 
  onStartConversation, 
  onPersonalize,
  showPersonalizeOption = true,
  className 
}: WelcomeScreenProps) {
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const handlePromptClick = (prompt: StarterPrompt) => {
    setSelectedPrompt(prompt.id);
    // Small delay for visual feedback before sending
    setTimeout(() => {
      onStartConversation(prompt.prompt);
    }, 150);
  };

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

      {/* Starter Prompts */}
      <div className="w-full max-w-2xl">
        <p className="text-sm text-zinc-500 text-center mb-4">
          {showPersonalizeOption ? 'Or jump right in with one of these' : 'Try one of these to get started'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => handlePromptClick(prompt)}
              disabled={selectedPrompt !== null}
              className={cn(
                'group relative flex items-center gap-4 p-4 rounded-xl',
                'bg-zinc-800/50 border border-zinc-700/50',
                'hover:bg-zinc-800 hover:border-zinc-600 hover:shadow-lg',
                'transition-all duration-200',
                'text-left',
                selectedPrompt === prompt.id && 'ring-2 ring-teal-500 bg-zinc-800',
                selectedPrompt !== null && selectedPrompt !== prompt.id && 'opacity-50'
              )}
            >
              {/* Icon */}
              <div className={cn(
                'flex size-12 shrink-0 items-center justify-center rounded-xl',
                'bg-gradient-to-br shadow-lg',
                prompt.gradient,
                'group-hover:scale-105 transition-transform'
              )}>
                <span className="text-white">{prompt.icon}</span>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200 mb-0.5">
                  {prompt.title}
                </p>
                <p className="text-xs text-zinc-500 line-clamp-2">
                  {prompt.prompt}
                </p>
              </div>
              
              {/* Arrow */}
              <ChevronRight className="size-4 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Custom Prompt Hint */}
      <div className="mt-8 text-center">
        <p className="text-xs text-zinc-600">
          Or just type your own question below ↓
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
