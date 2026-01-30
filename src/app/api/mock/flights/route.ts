import { NextRequest, NextResponse } from 'next/server';
import type { FlightCard } from '@/lib/db/schema';

// Major airports
const airports: Record<string, string> = {
  'new york': 'JFK',
  'nyc': 'JFK',
  'los angeles': 'LAX',
  'la': 'LAX',
  'san francisco': 'SFO',
  'chicago': 'ORD',
  'miami': 'MIA',
  'london': 'LHR',
  'paris': 'CDG',
  'tokyo': 'NRT',
  'sydney': 'SYD',
  'dubai': 'DXB',
  'singapore': 'SIN',
  'hong kong': 'HKG',
  'bali': 'DPS',
  'rome': 'FCO',
  'barcelona': 'BCN',
  'amsterdam': 'AMS',
  'bangkok': 'BKK',
  'seoul': 'ICN',
  'berlin': 'BER',
  'toronto': 'YYZ',
  'vancouver': 'YVR',
  'seattle': 'SEA',
  'boston': 'BOS',
  'denver': 'DEN',
  'atlanta': 'ATL',
  'dallas': 'DFW',
  'honolulu': 'HNL',
  'cancun': 'CUN',
};

const airlines = [
  { name: 'United Airlines', code: 'UA', basePrice: 1.0 },
  { name: 'Delta Air Lines', code: 'DL', basePrice: 1.05 },
  { name: 'American Airlines', code: 'AA', basePrice: 1.0 },
  { name: 'JetBlue', code: 'B6', basePrice: 0.85 },
  { name: 'Southwest', code: 'WN', basePrice: 0.75 },
  { name: 'Air France', code: 'AF', basePrice: 1.1 },
  { name: 'British Airways', code: 'BA', basePrice: 1.15 },
  { name: 'Lufthansa', code: 'LH', basePrice: 1.1 },
  { name: 'Emirates', code: 'EK', basePrice: 1.25 },
  { name: 'Singapore Airlines', code: 'SQ', basePrice: 1.2 },
  { name: 'ANA', code: 'NH', basePrice: 1.15 },
  { name: 'JAL', code: 'JL', basePrice: 1.1 },
  { name: 'Cathay Pacific', code: 'CX', basePrice: 1.1 },
  { name: 'Qantas', code: 'QF', basePrice: 1.15 },
  { name: 'KLM', code: 'KL', basePrice: 1.05 },
];

const cabinClasses = ['Economy', 'Premium Economy', 'Business', 'First'];
const cabinMultipliers: Record<string, number> = {
  'Economy': 1,
  'Premium Economy': 1.8,
  'Business': 3.5,
  'First': 6,
};

// Base prices by route distance (rough estimates)
function getBasePrice(from: string, to: string): number {
  const domestic = ['JFK', 'LAX', 'SFO', 'ORD', 'MIA', 'SEA', 'BOS', 'DEN', 'ATL', 'DFW', 'HNL', 'YYZ', 'YVR'];
  const fromDomestic = domestic.includes(from);
  const toDomestic = domestic.includes(to);

  if (fromDomestic && toDomestic) {
    // US domestic
    return 180 + Math.random() * 200;
  } else if ((from === 'JFK' || from === 'LAX') && (to === 'LHR' || to === 'CDG')) {
    // Transatlantic
    return 450 + Math.random() * 350;
  } else if (to === 'NRT' || to === 'HND' || to === 'ICN' || to === 'SIN' || to === 'HKG' || to === 'BKK') {
    // Trans-Pacific / Asia
    return 650 + Math.random() * 500;
  } else if (to === 'SYD' || to === 'DPS') {
    // Oceania
    return 800 + Math.random() * 600;
  } else if (to === 'DXB') {
    // Middle East
    return 550 + Math.random() * 400;
  }
  // Default international
  return 400 + Math.random() * 400;
}

function generateFlightNumber(airlineCode: string): string {
  return `${airlineCode}${Math.floor(100 + Math.random() * 8900)}`;
}

function formatDateTime(date: Date): string {
  return date.toISOString();
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function generateFlights(
  from: string,
  to: string,
  departureDate: Date,
  cabinClass?: string
): FlightCard[] {
  const flights: FlightCard[] = [];
  const numFlights = 5 + Math.floor(Math.random() * 4); // 5-8 flights

  // Generate departure times throughout the day
  const departureTimes = [6, 7, 9, 11, 13, 15, 17, 19, 21, 23];

  for (let i = 0; i < numFlights; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const cabin = cabinClass || cabinClasses[Math.floor(Math.random() * 2)]; // Mostly economy/premium economy
    const basePrice = getBasePrice(from, to);
    const price = Math.round(basePrice * airline.basePrice * cabinMultipliers[cabin]);

    const departureHour = departureTimes[i % departureTimes.length];
    const departureTime = new Date(departureDate);
    departureTime.setHours(departureHour, Math.floor(Math.random() * 60), 0, 0);

    // Flight duration based on route (rough estimates in hours)
    let duration = 3;
    if (to === 'NRT' || to === 'ICN' || to === 'SIN' || to === 'HKG') duration = 13 + Math.random() * 3;
    else if (to === 'LHR' || to === 'CDG' || to === 'AMS' || to === 'BER') duration = 7 + Math.random() * 2;
    else if (to === 'SYD' || to === 'DPS') duration = 15 + Math.random() * 5;
    else if (to === 'DXB') duration = 12 + Math.random() * 2;
    else if (['JFK', 'LAX', 'SFO', 'ORD', 'MIA'].includes(to)) duration = 2.5 + Math.random() * 3;

    const arrivalTime = addHours(departureTime, duration);

    flights.push({
      type: 'flight',
      airline: airline.name,
      flight_number: generateFlightNumber(airline.code),
      departure_airport: from,
      arrival_airport: to,
      departure_time: formatDateTime(departureTime),
      arrival_time: formatDateTime(arrivalTime),
      price,
      currency: 'USD',
      cabin_class: cabin,
      booking_url: `https://example.com/book/${airline.code.toLowerCase()}/${generateFlightNumber(airline.code)}`,
    });
  }

  // Sort by price
  return flights.sort((a, b) => a.price - b.price);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get('from')?.toLowerCase() || 'san francisco';
  const to = searchParams.get('to')?.toLowerCase() || searchParams.get('destination')?.toLowerCase() || '';
  const dateStr = searchParams.get('date') || searchParams.get('departure_date');
  const cabinClass = searchParams.get('cabin_class') || searchParams.get('class');
  const maxPrice = searchParams.get('max_price') ? parseInt(searchParams.get('max_price')!) : undefined;

  // Map city names to airport codes
  const fromAirport = airports[from] || from.toUpperCase().slice(0, 3);
  const toAirport = airports[to] || to.toUpperCase().slice(0, 3);

  // Parse date or use tomorrow
  let departureDate: Date;
  if (dateStr) {
    departureDate = new Date(dateStr);
    if (isNaN(departureDate.getTime())) {
      departureDate = new Date();
      departureDate.setDate(departureDate.getDate() + 1);
    }
  } else {
    departureDate = new Date();
    departureDate.setDate(departureDate.getDate() + 7); // Default to a week from now
  }

  // Validate cabin class
  const validCabin = cabinClass && cabinClasses.map(c => c.toLowerCase()).includes(cabinClass.toLowerCase())
    ? cabinClasses.find(c => c.toLowerCase() === cabinClass.toLowerCase())
    : undefined;

  let flights = generateFlights(fromAirport, toAirport, departureDate, validCabin);

  // Apply price filter
  if (maxPrice !== undefined) {
    flights = flights.filter(f => f.price <= maxPrice);
  }

  return NextResponse.json({
    flights,
    meta: {
      from: fromAirport,
      to: toAirport,
      date: departureDate.toISOString().split('T')[0],
      cabin_class: validCabin || 'all',
      total: flights.length,
    },
  });
}
