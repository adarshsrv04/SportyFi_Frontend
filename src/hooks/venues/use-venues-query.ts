
// import { useQuery } from '@tanstack/react-query';
// import { supabase } from '@/integrations/supabase/client';
// import type { VenueWithRelations } from '@/integrations/supabase/client';
// import { dummyVenues } from './venue-mock-data';

// // Interface for venue filter options
// export interface VenueFilters {
//   sportFilter?: string;
//   locationFilter?: string;
//   priceRange?: [number, number];
//   searchQuery?: string;
// }

// /**
//  * Hook for fetching venues with optional filtering
//  */
// export const useVenuesQuery = (filters?: VenueFilters) => {
//   return useQuery({
//     queryKey: ['venues', filters],
//     queryFn: async (): Promise<VenueWithRelations[]> => {
//       // Start with the main query for venues
//       let query = supabase
//         .from('venues')
//         .select(`
//           *,
//           sports:venue_sports(*),
//           amenities:venue_amenities(*),
//           images:venue_images(*)
//         `)
//         .eq('is_verified', true);

//       // Apply filters if provided
//       if (filters) {
//         // Filter by sport
//         if (filters.sportFilter && filters.sportFilter !== 'All Sports') {
//           // This is a bit tricky since we need to filter based on a related table
//           // We'll get all venues that have at least one sport matching the filter
//           const { data: sportFilteredVenueIds } = await supabase
//             .from('venue_sports')
//             .select('venue_id')
//             .eq('sport', filters.sportFilter);
          
//           if (sportFilteredVenueIds?.length) {
//             const venueIds = sportFilteredVenueIds.map(v => v.venue_id);
//             query = query.in('id', venueIds);
//           } else {
//             // No venues match this sport filter
//             return [];
//           }
//         }

//         // Filter by location
//         if (filters.locationFilter && filters.locationFilter !== 'All Locations') {
//           query = query.ilike('location', `%${filters.locationFilter}%`);
//         }

//         // Filter by price range
//         if (filters.priceRange) {
//           query = query
//             .gte('price_per_hour', filters.priceRange[0])
//             .lte('price_per_hour', filters.priceRange[1]);
//         }

//         // Filter by search query (search in name, description, and location)
//         if (filters.searchQuery) {
//           query = query.or(`name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,location.ilike.%${filters.searchQuery}%`);
//         }
//       }

//       const { data, error } = await query;
//       // const data = dummyVenues;

//       // if (error) {
//       //   console.error('Error fetching venues:', error);
//       //   throw new Error('Failed to fetch venues');
//       // }

//       return data || [];
//     },
//   });
// };




import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Interface for venue filter options
export interface VenueFilters {
  sportFilter?: string;
  locationFilter?: string;
  priceRange?: [number, number];
  searchQuery?: string;
}

// Interface for Venue Response (match backend DTO)
export interface Venue {
  id: string;
  name: string;
  description: string;
  location: string;
  pricePerHour: number;
  isVerified: boolean;
  contactInfo: string;
  sports: string[];
  amenities: string[];
  images: string[];
  ownerId: string;
  status: string;
}

/**
 * Hook for fetching venues from Spring Boot REST API
 */
export const useVenuesQuery = (filters?: VenueFilters) => {
  return useQuery({
    queryKey: ['venues', filters],
    queryFn: async (): Promise<Venue[]> => {
      const params: any = {};

      // Apply filters
      if (filters) {
        if (filters.sportFilter && filters.sportFilter !== 'All Sports') {
          params.sport = filters.sportFilter;
        }

        if (filters.locationFilter && filters.locationFilter !== 'All Locations') {
          params.location = filters.locationFilter;
        }

        if (filters.priceRange) {
          params.minPrice = filters.priceRange[0];
          params.maxPrice = filters.priceRange[1];
        }

        if (filters.searchQuery) {
          params.search = filters.searchQuery;
        }
      }

      const response = await axios.get('http://localhost:8080/sportyfi/venues', { params });

      return response.data || [];
    },
  });
};
