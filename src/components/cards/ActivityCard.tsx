'use client';

import { cn } from '@/lib/utils';
import type { ActivityCard as ActivityCardData } from '@/lib/db/schema';
import { Compass, MapPin, Clock, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActivityCardProps {
  data: ActivityCardData;
  className?: string;
}

export function ActivityCard({ data, className }: ActivityCardProps) {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-zinc-700/50 bg-zinc-800/60 backdrop-blur-sm',
        'transition-all duration-200 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5',
        className
      )}
    >
      {/* Image section */}
      {data.image_url ? (
        <div className="relative h-32 w-full overflow-hidden bg-zinc-700">
          <img
            src={data.image_url}
            alt={data.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent" />
        </div>
      ) : (
        <div className="flex h-20 w-full items-center justify-center bg-gradient-to-br from-emerald-600/20 to-teal-600/20">
          <Compass className="size-8 text-emerald-400/50" />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-zinc-100">{data.name}</h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-zinc-400">
              <MapPin className="size-3" />
              <span className="truncate">{data.location}</span>
            </div>
          </div>
          
          {/* Rating */}
          {data.rating && (
            <div className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-amber-300">{data.rating}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {data.description && (
          <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
            {data.description}
          </p>
        )}

        {/* Duration */}
        {data.duration && (
          <div className="mt-2 flex items-center gap-1 text-xs text-zinc-400">
            <Clock className="size-3" />
            <span>{data.duration}</span>
          </div>
        )}

        {/* Footer: Price & Action */}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-zinc-700/50 pt-3">
          {data.price && data.currency ? (
            <div>
              <span className="text-lg font-bold text-emerald-400">
                {formatPrice(data.price, data.currency)}
              </span>
              <span className="text-xs text-zinc-400"> / person</span>
            </div>
          ) : (
            <span className="text-sm text-zinc-500">Price varies</span>
          )}
          
          {data.booking_url && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
              asChild
            >
              <a href={data.booking_url} target="_blank" rel="noopener noreferrer">
                Book <ExternalLink className="size-3" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
