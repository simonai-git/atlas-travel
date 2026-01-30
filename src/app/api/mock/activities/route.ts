import { NextRequest, NextResponse } from 'next/server';
import type { ActivityCard } from '@/lib/db/schema';

// Curated Unsplash activity images
const activityImages = {
  tour: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
  museum: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=80',
  food: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  adventure: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
  beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  hiking: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
  spa: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
  nightlife: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&q=80',
  temple: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
  cooking: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
  wine: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80',
  art: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800&q=80',
  boat: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
  safari: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80',
  shopping: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80',
  show: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800&q=80',
};

// Activities by destination
const activitiesByDestination: Record<string, Omit<ActivityCard, 'type'>[]> = {
  'paris': [
    { name: 'Eiffel Tower Summit Access', location: 'Champ de Mars, Paris', description: 'Skip-the-line access to the summit with stunning panoramic views of Paris. Includes audio guide.', price: 85, currency: 'USD', duration: '2-3 hours', rating: 4.8, image_url: activityImages.tour, booking_url: 'https://example.com/book/eiffel-summit' },
    { name: 'Louvre Museum Guided Tour', location: 'Louvre Museum, Paris', description: 'Expert-led tour covering the Mona Lisa, Venus de Milo, and other masterpieces. Small groups only.', price: 65, currency: 'USD', duration: '3 hours', rating: 4.9, image_url: activityImages.museum, booking_url: 'https://example.com/book/louvre-tour' },
    { name: 'Seine River Dinner Cruise', location: 'Port de la Bourdonnais, Paris', description: 'Gourmet French dinner aboard a glass-enclosed boat with views of illuminated monuments.', price: 120, currency: 'USD', duration: '2.5 hours', rating: 4.7, image_url: activityImages.boat, booking_url: 'https://example.com/book/seine-cruise' },
    { name: 'French Cooking Class', location: 'Le Marais, Paris', description: 'Learn to make classic French dishes with a professional chef. Includes market visit and wine pairing.', price: 150, currency: 'USD', duration: '4 hours', rating: 4.9, image_url: activityImages.cooking, booking_url: 'https://example.com/book/paris-cooking' },
    { name: 'Montmartre Walking Tour', location: 'Montmartre, Paris', description: 'Explore the artistic neighborhood, visit Sacré-Cœur, and discover hidden gems.', price: 35, currency: 'USD', duration: '2 hours', rating: 4.6, image_url: activityImages.tour, booking_url: 'https://example.com/book/montmartre-walk' },
    { name: 'Versailles Palace Day Trip', location: 'Versailles', description: 'Full-day trip including palace, gardens, and Marie Antoinette\'s Estate. Lunch included.', price: 145, currency: 'USD', duration: '8 hours', rating: 4.8, image_url: activityImages.tour, booking_url: 'https://example.com/book/versailles' },
    { name: 'Wine Tasting in Saint-Germain', location: 'Saint-Germain-des-Prés, Paris', description: 'Sample premium French wines with a sommelier in a historic cellar.', price: 75, currency: 'USD', duration: '2 hours', rating: 4.7, image_url: activityImages.wine, booking_url: 'https://example.com/book/paris-wine' },
    { name: 'Moulin Rouge Show', location: 'Pigalle, Paris', description: 'Iconic cabaret show with champagne. World-famous French cancan and spectacular costumes.', price: 185, currency: 'USD', duration: '2 hours', rating: 4.6, image_url: activityImages.show, booking_url: 'https://example.com/book/moulin-rouge' },
  ],
  'tokyo': [
    { name: 'Tsukiji Outer Market Food Tour', location: 'Tsukiji, Tokyo', description: 'Taste fresh sushi, tamagoyaki, and Japanese street food with a local guide.', price: 95, currency: 'USD', duration: '3 hours', rating: 4.9, image_url: activityImages.food, booking_url: 'https://example.com/book/tsukiji-tour' },
    { name: 'Traditional Tea Ceremony', location: 'Asakusa, Tokyo', description: 'Experience authentic Japanese tea ceremony in a traditional tatami room.', price: 55, currency: 'USD', duration: '1.5 hours', rating: 4.8, image_url: activityImages.temple, booking_url: 'https://example.com/book/tea-ceremony' },
    { name: 'Senso-ji Temple & Asakusa Tour', location: 'Asakusa, Tokyo', description: 'Explore Tokyo\'s oldest temple, Nakamise shopping street, and local traditions.', price: 45, currency: 'USD', duration: '2.5 hours', rating: 4.7, image_url: activityImages.temple, booking_url: 'https://example.com/book/sensoji-tour' },
    { name: 'Shibuya & Harajuku Culture Walk', location: 'Shibuya, Tokyo', description: 'Discover youth culture, fashion, and the famous scramble crossing.', price: 40, currency: 'USD', duration: '3 hours', rating: 4.6, image_url: activityImages.tour, booking_url: 'https://example.com/book/shibuya-walk' },
    { name: 'Ramen Making Class', location: 'Shinjuku, Tokyo', description: 'Learn to make authentic Japanese ramen from scratch with a master chef.', price: 85, currency: 'USD', duration: '3 hours', rating: 4.9, image_url: activityImages.cooking, booking_url: 'https://example.com/book/ramen-class' },
    { name: 'Mt. Fuji Day Trip', location: 'Mt. Fuji', description: 'Full-day excursion to Mt. Fuji 5th Station, Lake Kawaguchi, and traditional village.', price: 125, currency: 'USD', duration: '10 hours', rating: 4.7, image_url: activityImages.hiking, booking_url: 'https://example.com/book/fuji-trip' },
    { name: 'Robot Restaurant Show', location: 'Shinjuku, Tokyo', description: 'Bizarre and spectacular robot cabaret show unique to Tokyo. Dinner bento included.', price: 80, currency: 'USD', duration: '1.5 hours', rating: 4.3, image_url: activityImages.show, booking_url: 'https://example.com/book/robot-restaurant' },
    { name: 'Tokyo Night Photography Tour', location: 'Various, Tokyo', description: 'Capture neon-lit streets, hidden alleys, and cityscapes with a pro photographer.', price: 70, currency: 'USD', duration: '3 hours', rating: 4.8, image_url: activityImages.nightlife, booking_url: 'https://example.com/book/tokyo-photo' },
    { name: 'Onsen & Spa Experience', location: 'Odaiba, Tokyo', description: 'Traditional Japanese hot spring bath house with multiple pools, saunas, and relaxation areas.', price: 35, currency: 'USD', duration: '3-4 hours', rating: 4.5, image_url: activityImages.spa, booking_url: 'https://example.com/book/tokyo-onsen' },
  ],
  'new york': [
    { name: 'Statue of Liberty & Ellis Island', location: 'Liberty Island, NYC', description: 'Ferry ride, pedestal access, and audio-guided tour of both islands.', price: 65, currency: 'USD', duration: '4-5 hours', rating: 4.7, image_url: activityImages.tour, booking_url: 'https://example.com/book/statue-liberty' },
    { name: 'Broadway Show Tickets', location: 'Theater District, NYC', description: 'Premium seats to top Broadway musicals. Various shows available.', price: 175, currency: 'USD', duration: '2.5 hours', rating: 4.9, image_url: activityImages.show, booking_url: 'https://example.com/book/broadway' },
    { name: 'Central Park Bike Tour', location: 'Central Park, NYC', description: 'Guided cycling tour through the park\'s iconic landmarks and hidden gems.', price: 50, currency: 'USD', duration: '2 hours', rating: 4.6, image_url: activityImages.tour, booking_url: 'https://example.com/book/central-park-bike' },
    { name: 'Food Tour: Greenwich Village', location: 'Greenwich Village, NYC', description: 'Sample NYC\'s best pizza, bagels, Italian pastries, and more with a local foodie.', price: 85, currency: 'USD', duration: '3 hours', rating: 4.8, image_url: activityImages.food, booking_url: 'https://example.com/book/village-food' },
    { name: 'Met Museum Highlights Tour', location: 'Upper East Side, NYC', description: 'Expert-guided tour of The Metropolitan Museum of Art\'s greatest treasures.', price: 55, currency: 'USD', duration: '2 hours', rating: 4.8, image_url: activityImages.museum, booking_url: 'https://example.com/book/met-tour' },
    { name: 'Empire State Building at Night', location: 'Midtown, NYC', description: 'Skip-the-line sunset and night views from the 86th floor observation deck.', price: 60, currency: 'USD', duration: '1-2 hours', rating: 4.6, image_url: activityImages.tour, booking_url: 'https://example.com/book/empire-night' },
    { name: 'Jazz Club Experience', location: 'Harlem, NYC', description: 'Evening at a historic Harlem jazz club with live music and dinner.', price: 95, currency: 'USD', duration: '3 hours', rating: 4.7, image_url: activityImages.nightlife, booking_url: 'https://example.com/book/harlem-jazz' },
    { name: 'Street Art Walking Tour', location: 'Bushwick, Brooklyn', description: 'Explore Brooklyn\'s vibrant street art scene with a local artist guide.', price: 35, currency: 'USD', duration: '2 hours', rating: 4.5, image_url: activityImages.art, booking_url: 'https://example.com/book/bushwick-art' },
  ],
  'bali': [
    { name: 'Tegallalang Rice Terraces Tour', location: 'Ubud, Bali', description: 'Explore stunning UNESCO rice terraces with coffee plantation visit and swing experience.', price: 45, currency: 'USD', duration: '4 hours', rating: 4.7, image_url: activityImages.tour, booking_url: 'https://example.com/book/rice-terraces' },
    { name: 'Sunrise Trek at Mt. Batur', location: 'Kintamani, Bali', description: 'Early morning volcano hike to catch a spectacular sunrise above the clouds.', price: 65, currency: 'USD', duration: '6 hours', rating: 4.8, image_url: activityImages.hiking, booking_url: 'https://example.com/book/batur-trek' },
    { name: 'Balinese Cooking Class', location: 'Ubud, Bali', description: 'Market tour and hands-on cooking with a local family in their traditional compound.', price: 40, currency: 'USD', duration: '5 hours', rating: 4.9, image_url: activityImages.cooking, booking_url: 'https://example.com/book/bali-cooking' },
    { name: 'Temple Tour: Uluwatu & Tanah Lot', location: 'South Bali', description: 'Visit two of Bali\'s most iconic clifftop temples at sunset. Kecak dance included.', price: 55, currency: 'USD', duration: '6 hours', rating: 4.6, image_url: activityImages.temple, booking_url: 'https://example.com/book/temple-tour' },
    { name: 'Snorkeling at Nusa Penida', location: 'Nusa Penida', description: 'Day trip to crystal-clear waters, swim with manta rays, and visit stunning viewpoints.', price: 85, currency: 'USD', duration: '10 hours', rating: 4.8, image_url: activityImages.beach, booking_url: 'https://example.com/book/nusa-penida' },
    { name: 'Traditional Balinese Spa', location: 'Seminyak, Bali', description: 'Luxury spa package with flower bath, traditional massage, and body scrub.', price: 75, currency: 'USD', duration: '3 hours', rating: 4.7, image_url: activityImages.spa, booking_url: 'https://example.com/book/bali-spa' },
    { name: 'Ubud Monkey Forest & Art Villages', location: 'Ubud, Bali', description: 'Visit the sacred monkey sanctuary and explore artisan villages for silver, wood, and paintings.', price: 35, currency: 'USD', duration: '4 hours', rating: 4.5, image_url: activityImages.tour, booking_url: 'https://example.com/book/monkey-forest' },
    { name: 'White Water Rafting', location: 'Ayung River, Bali', description: 'Exciting rafting through jungle gorges with stunning scenery and lunch included.', price: 50, currency: 'USD', duration: '5 hours', rating: 4.6, image_url: activityImages.adventure, booking_url: 'https://example.com/book/bali-rafting' },
    { name: 'Beach Club Day Pass', location: 'Seminyak, Bali', description: 'Full day at a trendy beach club with pool, loungers, and DJ entertainment.', price: 60, currency: 'USD', duration: 'Full day', rating: 4.4, image_url: activityImages.beach, booking_url: 'https://example.com/book/beach-club' },
  ],
  'default': [
    { name: 'City Walking Tour', location: 'City Center', description: 'Discover hidden gems and local favorites with an expert guide.', price: 35, currency: 'USD', duration: '2.5 hours', rating: 4.6, image_url: activityImages.tour, booking_url: 'https://example.com/book/city-tour' },
    { name: 'Local Food Experience', location: 'Various Locations', description: 'Taste authentic local cuisine and learn about culinary traditions.', price: 65, currency: 'USD', duration: '3 hours', rating: 4.7, image_url: activityImages.food, booking_url: 'https://example.com/book/food-tour' },
    { name: 'Museum Pass', location: 'City Museums', description: 'Skip-the-line access to top museums with audio guide.', price: 45, currency: 'USD', duration: 'Full day', rating: 4.5, image_url: activityImages.museum, booking_url: 'https://example.com/book/museum-pass' },
    { name: 'Sunset Boat Cruise', location: 'Harbor', description: 'Scenic cruise with drinks and light snacks as the sun sets.', price: 75, currency: 'USD', duration: '2 hours', rating: 4.6, image_url: activityImages.boat, booking_url: 'https://example.com/book/sunset-cruise' },
    { name: 'Cooking Class', location: 'Local Kitchen', description: 'Learn to cook traditional dishes with a local chef.', price: 85, currency: 'USD', duration: '3 hours', rating: 4.8, image_url: activityImages.cooking, booking_url: 'https://example.com/book/cooking-class' },
    { name: 'Day Trip Adventure', location: 'Nearby Attractions', description: 'Full-day excursion to scenic spots outside the city.', price: 95, currency: 'USD', duration: '8 hours', rating: 4.5, image_url: activityImages.adventure, booking_url: 'https://example.com/book/day-trip' },
    { name: 'Spa & Wellness Experience', location: 'Local Spa', description: 'Relaxing massage and wellness treatments in a serene setting.', price: 80, currency: 'USD', duration: '2 hours', rating: 4.7, image_url: activityImages.spa, booking_url: 'https://example.com/book/spa' },
    { name: 'Nightlife & Bar Hopping', location: 'Entertainment District', description: 'Explore the best bars and nightlife spots with a local guide.', price: 55, currency: 'USD', duration: '4 hours', rating: 4.4, image_url: activityImages.nightlife, booking_url: 'https://example.com/book/nightlife' },
  ],
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const destination = searchParams.get('destination')?.toLowerCase() || '';
  const category = searchParams.get('category')?.toLowerCase();
  const maxPrice = searchParams.get('max_price') ? parseInt(searchParams.get('max_price')!) : undefined;
  const minRating = searchParams.get('min_rating') ? parseFloat(searchParams.get('min_rating')!) : undefined;

  // Find matching destination or use default
  let activities = activitiesByDestination['default'];
  for (const [key, value] of Object.entries(activitiesByDestination)) {
    if (destination.includes(key) || key.includes(destination)) {
      activities = value;
      break;
    }
  }

  // Apply filters
  let filteredActivities = activities;
  if (maxPrice !== undefined) {
    filteredActivities = filteredActivities.filter(a => (a.price || 0) <= maxPrice);
  }
  if (minRating !== undefined) {
    filteredActivities = filteredActivities.filter(a => (a.rating || 0) >= minRating);
  }
  if (category) {
    // Simple category matching based on name/description keywords
    const categoryKeywords: Record<string, string[]> = {
      'food': ['food', 'cooking', 'culinary', 'restaurant', 'taste', 'wine', 'ramen', 'pizza'],
      'culture': ['museum', 'temple', 'palace', 'historic', 'art', 'tea ceremony', 'cultural'],
      'adventure': ['trek', 'hike', 'rafting', 'snorkel', 'bike', 'adventure', 'climb'],
      'relaxation': ['spa', 'beach', 'sunset', 'cruise', 'relax', 'wellness'],
      'nightlife': ['night', 'bar', 'jazz', 'show', 'cabaret', 'club'],
    };
    const keywords = categoryKeywords[category] || [category];
    filteredActivities = filteredActivities.filter(a =>
      keywords.some(kw =>
        a.name.toLowerCase().includes(kw) ||
        (a.description?.toLowerCase().includes(kw))
      )
    );
  }

  // Add type to each activity
  const result: ActivityCard[] = filteredActivities.map(activity => ({
    type: 'activity' as const,
    ...activity,
  }));

  // Add slight price variation (±15%)
  const randomizedResult = result.map(activity => ({
    ...activity,
    price: activity.price ? Math.round(activity.price * (0.85 + Math.random() * 0.3)) : undefined,
  }));

  return NextResponse.json({
    activities: randomizedResult,
    meta: {
      destination: destination || 'all',
      category: category || 'all',
      total: randomizedResult.length,
    },
  });
}
