import { NextRequest, NextResponse } from 'next/server';
import type { HotelCard } from '@/lib/db/schema';

// Unsplash hotel images - curated for quality
const hotelImages = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', // luxury pool
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80', // hotel lobby
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80', // hotel room
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80', // resort pool
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80', // hotel exterior
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80', // grand hotel
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80', // boutique hotel
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80', // modern room
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80', // beach resort
  'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80', // city hotel
];

// Hotel data by destination
const hotelsByDestination: Record<string, Omit<HotelCard, 'type' | 'check_in' | 'check_out'>[]> = {
  'paris': [
    { name: 'Hôtel Plaza Athénée', location: 'Avenue Montaigne, Paris', price_per_night: 895, currency: 'USD', rating: 4.9, amenities: ['Spa', 'Restaurant', 'Room Service', 'Concierge', 'Fitness Center'], image_url: hotelImages[5], booking_url: 'https://example.com/book/plaza-athenee' },
    { name: 'Le Marais Boutique Hotel', location: 'Le Marais, Paris', price_per_night: 285, currency: 'USD', rating: 4.6, amenities: ['Free WiFi', 'Breakfast', 'Bar', 'Courtyard'], image_url: hotelImages[6], booking_url: 'https://example.com/book/le-marais' },
    { name: 'Hôtel des Arts Montmartre', location: 'Montmartre, Paris', price_per_night: 175, currency: 'USD', rating: 4.3, amenities: ['Free WiFi', 'Breakfast', 'Tour Desk'], image_url: hotelImages[9], booking_url: 'https://example.com/book/arts-montmartre' },
    { name: 'Pullman Paris Tour Eiffel', location: 'Near Eiffel Tower, Paris', price_per_night: 420, currency: 'USD', rating: 4.5, amenities: ['Restaurant', 'Bar', 'Fitness Center', 'Business Center', 'Parking'], image_url: hotelImages[1], booking_url: 'https://example.com/book/pullman-eiffel' },
    { name: 'Saint Germain Suites', location: 'Saint-Germain-des-Prés, Paris', price_per_night: 345, currency: 'USD', rating: 4.7, amenities: ['Kitchenette', 'Free WiFi', 'Laundry', 'Concierge'], image_url: hotelImages[7], booking_url: 'https://example.com/book/st-germain' },
    { name: 'Budget Inn Bastille', location: 'Bastille, Paris', price_per_night: 95, currency: 'USD', rating: 3.8, amenities: ['Free WiFi', '24h Reception'], image_url: hotelImages[9], booking_url: 'https://example.com/book/budget-bastille' },
  ],
  'tokyo': [
    { name: 'Park Hyatt Tokyo', location: 'Shinjuku, Tokyo', price_per_night: 750, currency: 'USD', rating: 4.8, amenities: ['Spa', 'Pool', 'Restaurant', 'Bar', 'Fitness Center', 'City Views'], image_url: hotelImages[5], booking_url: 'https://example.com/book/park-hyatt-tokyo' },
    { name: 'Aman Tokyo', location: 'Otemachi, Tokyo', price_per_night: 1200, currency: 'USD', rating: 4.9, amenities: ['Spa', 'Restaurant', 'Private Onsen', 'Concierge', 'Garden'], image_url: hotelImages[0], booking_url: 'https://example.com/book/aman-tokyo' },
    { name: 'Shibuya Stream Excel Hotel', location: 'Shibuya, Tokyo', price_per_night: 280, currency: 'USD', rating: 4.5, amenities: ['Free WiFi', 'Restaurant', 'Business Center'], image_url: hotelImages[9], booking_url: 'https://example.com/book/shibuya-stream' },
    { name: 'Asakusa Ryokan Mikawaya', location: 'Asakusa, Tokyo', price_per_night: 195, currency: 'USD', rating: 4.4, amenities: ['Traditional Tatami', 'Japanese Breakfast', 'Onsen', 'Tea Service'], image_url: hotelImages[6], booking_url: 'https://example.com/book/mikawaya' },
    { name: 'Hotel Gracery Shinjuku', location: 'Kabukicho, Shinjuku', price_per_night: 165, currency: 'USD', rating: 4.2, amenities: ['Free WiFi', 'Restaurant', 'Godzilla Terrace'], image_url: hotelImages[4], booking_url: 'https://example.com/book/gracery' },
    { name: 'MUJI Hotel Ginza', location: 'Ginza, Tokyo', price_per_night: 320, currency: 'USD', rating: 4.6, amenities: ['Minimalist Design', 'Restaurant', 'Lounge', 'MUJI Store'], image_url: hotelImages[7], booking_url: 'https://example.com/book/muji-ginza' },
    { name: 'Capsule Inn Akihabara', location: 'Akihabara, Tokyo', price_per_night: 45, currency: 'USD', rating: 3.9, amenities: ['Free WiFi', 'Lockers', 'Shower'], image_url: hotelImages[9], booking_url: 'https://example.com/book/capsule-akihabara' },
  ],
  'new york': [
    { name: 'The Plaza Hotel', location: 'Fifth Avenue, Manhattan', price_per_night: 895, currency: 'USD', rating: 4.8, amenities: ['Spa', 'Fitness Center', 'Restaurant', 'Room Service', 'Concierge', 'Afternoon Tea'], image_url: hotelImages[5], booking_url: 'https://example.com/book/the-plaza' },
    { name: 'The Standard High Line', location: 'Meatpacking District, NYC', price_per_night: 425, currency: 'USD', rating: 4.5, amenities: ['Rooftop Bar', 'Restaurant', 'Fitness Center', 'High Line Views'], image_url: hotelImages[4], booking_url: 'https://example.com/book/standard-highline' },
    { name: '1 Hotel Brooklyn Bridge', location: 'Brooklyn, NYC', price_per_night: 385, currency: 'USD', rating: 4.6, amenities: ['Pool', 'Spa', 'Restaurant', 'Skyline Views', 'Eco-Friendly'], image_url: hotelImages[3], booking_url: 'https://example.com/book/1hotel-brooklyn' },
    { name: 'Pod 51', location: 'Midtown East, Manhattan', price_per_night: 145, currency: 'USD', rating: 4.0, amenities: ['Free WiFi', 'Rooftop', 'Cafe'], image_url: hotelImages[9], booking_url: 'https://example.com/book/pod51' },
    { name: 'Ace Hotel New York', location: 'NoMad, Manhattan', price_per_night: 295, currency: 'USD', rating: 4.4, amenities: ['Restaurant', 'Coffee Shop', 'Fitness Center', 'Music Venue'], image_url: hotelImages[6], booking_url: 'https://example.com/book/ace-ny' },
    { name: 'The Langham Fifth Avenue', location: 'Midtown, Manhattan', price_per_night: 650, currency: 'USD', rating: 4.7, amenities: ['Spa', 'Restaurant', 'Bar', 'Fitness Center', 'Butler Service'], image_url: hotelImages[1], booking_url: 'https://example.com/book/langham-fifth' },
  ],
  'bali': [
    { name: 'Four Seasons Resort Bali at Sayan', location: 'Ubud, Bali', price_per_night: 850, currency: 'USD', rating: 4.9, amenities: ['Infinity Pool', 'Spa', 'Yoga', 'Restaurant', 'Rice Paddy Views'], image_url: hotelImages[0], booking_url: 'https://example.com/book/fs-sayan' },
    { name: 'Alila Villas Uluwatu', location: 'Uluwatu, Bali', price_per_night: 720, currency: 'USD', rating: 4.8, amenities: ['Private Pool', 'Spa', 'Cliff Views', 'Beach Club', 'Butler'], image_url: hotelImages[3], booking_url: 'https://example.com/book/alila-uluwatu' },
    { name: 'Potato Head Suites', location: 'Seminyak, Bali', price_per_night: 385, currency: 'USD', rating: 4.6, amenities: ['Beach Club', 'Pool', 'Restaurant', 'DJ Sets', 'Art Gallery'], image_url: hotelImages[8], booking_url: 'https://example.com/book/potato-head' },
    { name: 'Komaneka at Bisma', location: 'Ubud, Bali', price_per_night: 245, currency: 'USD', rating: 4.5, amenities: ['Pool', 'Spa', 'Restaurant', 'Valley Views', 'Cooking Class'], image_url: hotelImages[0], booking_url: 'https://example.com/book/komaneka' },
    { name: 'The Kayon Jungle Resort', location: 'Ubud, Bali', price_per_night: 175, currency: 'USD', rating: 4.4, amenities: ['Infinity Pool', 'Spa', 'Breakfast', 'Jungle Views'], image_url: hotelImages[3], booking_url: 'https://example.com/book/kayon' },
    { name: 'Puri Santrian Beach Resort', location: 'Sanur, Bali', price_per_night: 95, currency: 'USD', rating: 4.1, amenities: ['Beach Access', 'Pool', 'Restaurant', 'Garden'], image_url: hotelImages[8], booking_url: 'https://example.com/book/puri-santrian' },
  ],
  'default': [
    { name: 'Grand Hotel & Spa', location: 'City Center', price_per_night: 350, currency: 'USD', rating: 4.6, amenities: ['Spa', 'Pool', 'Restaurant', 'Fitness Center', 'Room Service'], image_url: hotelImages[0], booking_url: 'https://example.com/book/grand-hotel' },
    { name: 'Boutique Hotel Central', location: 'Downtown', price_per_night: 225, currency: 'USD', rating: 4.4, amenities: ['Free WiFi', 'Breakfast', 'Bar', 'Concierge'], image_url: hotelImages[6], booking_url: 'https://example.com/book/boutique-central' },
    { name: 'Skyline Tower Hotel', location: 'Business District', price_per_night: 195, currency: 'USD', rating: 4.2, amenities: ['Rooftop Bar', 'Restaurant', 'Business Center', 'Gym'], image_url: hotelImages[4], booking_url: 'https://example.com/book/skyline' },
    { name: 'Comfort Inn Express', location: 'Near Airport', price_per_night: 89, currency: 'USD', rating: 3.8, amenities: ['Free WiFi', 'Breakfast', 'Shuttle', 'Parking'], image_url: hotelImages[9], booking_url: 'https://example.com/book/comfort-airport' },
    { name: 'The Waterfront Resort', location: 'Harbor Area', price_per_night: 420, currency: 'USD', rating: 4.7, amenities: ['Beach Access', 'Pool', 'Spa', 'Water Sports', 'Restaurant'], image_url: hotelImages[8], booking_url: 'https://example.com/book/waterfront' },
    { name: 'Urban Loft Suites', location: 'Arts District', price_per_night: 165, currency: 'USD', rating: 4.3, amenities: ['Kitchenette', 'Free WiFi', 'Workspace', 'Laundry'], image_url: hotelImages[7], booking_url: 'https://example.com/book/urban-loft' },
    { name: 'Heritage Manor', location: 'Historic Quarter', price_per_night: 275, currency: 'USD', rating: 4.5, amenities: ['Garden', 'Afternoon Tea', 'Library', 'Antique Decor'], image_url: hotelImages[5], booking_url: 'https://example.com/book/heritage' },
  ],
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const destination = searchParams.get('destination')?.toLowerCase() || '';
  const checkIn = searchParams.get('check_in') || searchParams.get('checkIn');
  const checkOut = searchParams.get('check_out') || searchParams.get('checkOut');
  const minPrice = searchParams.get('min_price') ? parseInt(searchParams.get('min_price')!) : undefined;
  const maxPrice = searchParams.get('max_price') ? parseInt(searchParams.get('max_price')!) : undefined;
  const minRating = searchParams.get('min_rating') ? parseFloat(searchParams.get('min_rating')!) : undefined;

  // Find matching destination or use default
  let hotels = hotelsByDestination['default'];
  for (const [key, value] of Object.entries(hotelsByDestination)) {
    if (destination.includes(key) || key.includes(destination)) {
      hotels = value;
      break;
    }
  }

  // Apply filters
  let filteredHotels = hotels;
  if (minPrice !== undefined) {
    filteredHotels = filteredHotels.filter(h => h.price_per_night >= minPrice);
  }
  if (maxPrice !== undefined) {
    filteredHotels = filteredHotels.filter(h => h.price_per_night <= maxPrice);
  }
  if (minRating !== undefined) {
    filteredHotels = filteredHotels.filter(h => (h.rating || 0) >= minRating);
  }

  // Add type and dates to each hotel
  const result: HotelCard[] = filteredHotels.map(hotel => ({
    type: 'hotel' as const,
    ...hotel,
    check_in: checkIn || undefined,
    check_out: checkOut || undefined,
  }));

  // Add slight randomization to prices (±10%)
  const randomizedResult = result.map(hotel => ({
    ...hotel,
    price_per_night: Math.round(hotel.price_per_night * (0.9 + Math.random() * 0.2)),
  }));

  return NextResponse.json({
    hotels: randomizedResult,
    meta: {
      destination: destination || 'all',
      check_in: checkIn,
      check_out: checkOut,
      total: randomizedResult.length,
    },
  });
}
