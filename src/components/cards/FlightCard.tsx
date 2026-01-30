'use client';

import { cn } from '@/lib/utils';
import type { FlightCard as FlightCardData } from '@/lib/db/schema';
import { Plane, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FlightCardProps {
  data: FlightCardData;
  className?: string;
}

export function FlightCard({ data, className }: FlightCardProps) {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return timeStr;
    }
  };

  const formatDate = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-zinc-700/50 bg-zinc-800/60 backdrop-blur-sm',
        'transition-all duration-200 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-zinc-700/50 bg-zinc-800/80 px-4 py-2">
        <Plane className="size-4 text-cyan-400" />
        <span className="font-medium text-zinc-200">{data.airline}</span>
        <span className="text-xs text-zinc-500">•</span>
        <span className="text-sm text-zinc-400">{data.flight_number}</span>
        {data.cabin_class && (
          <>
            <span className="text-xs text-zinc-500">•</span>
            <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-medium text-cyan-300">
              {data.cabin_class}
            </span>
          </>
        )}
      </div>

      {/* Flight Route */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Departure */}
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold text-zinc-100">
              {data.departure_airport}
            </div>
            <div className="mt-1 text-lg font-medium text-zinc-300">
              {formatTime(data.departure_time)}
            </div>
            <div className="text-xs text-zinc-500">
              {formatDate(data.departure_time)}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center gap-1 px-4">
            <div className="flex items-center gap-1">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-cyan-500/50" />
              <ArrowRight className="size-4 text-cyan-400" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-cyan-500/50" />
            </div>
            <span className="text-[10px] text-zinc-500">Direct</span>
          </div>

          {/* Arrival */}
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold text-zinc-100">
              {data.arrival_airport}
            </div>
            <div className="mt-1 text-lg font-medium text-zinc-300">
              {formatTime(data.arrival_time)}
            </div>
            <div className="text-xs text-zinc-500">
              {formatDate(data.arrival_time)}
            </div>
          </div>
        </div>

        {/* Footer: Price & Action */}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-zinc-700/50 pt-3">
          <div>
            <span className="text-lg font-bold text-cyan-400">
              {formatPrice(data.price, data.currency)}
            </span>
            <span className="text-xs text-zinc-400"> / person</span>
          </div>
          
          {data.booking_url && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
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
