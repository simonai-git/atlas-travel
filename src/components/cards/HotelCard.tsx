'use client';

import { cn } from '@/lib/utils';
import type { HotelCard as HotelCardData } from '@/lib/db/schema';
import { Building2, MapPin, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HotelCardProps {
  data: HotelCardData;
  className?: string;
}

export function HotelCard({ data, className }: HotelCardProps) {
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
        'transition-all duration-200 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5',
        className
      )}
    >
      {/* Image section */}
      {data.image_url ? (
        <div className="relative h-32 w-full overflow-hidden bg-zinc-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.image_url}
            alt={data.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent" />
        </div>
      ) : (
        <div className="flex h-24 w-full items-center justify-center bg-gradient-to-br from-teal-600/20 to-cyan-600/20">
          <Building2 className="size-10 text-teal-400/50" />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="truncate font-semibold text-zinc-100">{data.name}</h3>
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

        {/* Dates */}
        {(data.check_in || data.check_out) && (
          <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
            {data.check_in && <span>Check-in: {data.check_in}</span>}
            {data.check_in && data.check_out && <span>•</span>}
            {data.check_out && <span>Check-out: {data.check_out}</span>}
          </div>
        )}

        {/* Amenities */}
        {data.amenities && data.amenities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {data.amenities.slice(0, 4).map((amenity) => (
              <span
                key={amenity}
                className="rounded-full bg-zinc-700/50 px-2 py-0.5 text-[10px] text-zinc-300"
              >
                {amenity}
              </span>
            ))}
            {data.amenities.length > 4 && (
              <span className="rounded-full bg-zinc-700/50 px-2 py-0.5 text-[10px] text-zinc-400">
                +{data.amenities.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Footer: Price & Action */}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-zinc-700/50 pt-3">
          <div>
            <span className="text-lg font-bold text-teal-400">
              {formatPrice(data.price_per_night, data.currency)}
            </span>
            <span className="text-xs text-zinc-400"> / night</span>
          </div>
          
          {data.booking_url && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 border-teal-500/30 text-teal-400 hover:bg-teal-500/10 hover:text-teal-300"
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
