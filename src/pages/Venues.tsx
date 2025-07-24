import React, { useState } from "react";
import SportyFiHeader from "@/components/SportyFiHeader";
import NavigationButtons from "@/components/NavigationButtons";
import VenueCard from "@/components/venues/VenueCard";
import VenueFilter from "@/components/venues/VenueFilter";
import { Map, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useVenues } from "@/hooks/use-venues";
import type { VenueWithRelations } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const Venues = () => {
  const { user } = useAuth();
  const [filterValues, setFilterValues] = useState({
    searchQuery: '',
    sport: 'All Sports',
    location: 'All Locations',
    priceRange: [0, 5000] as [number, number],
  });

  const { data: venues, isLoading, error } = useVenues({
    sportFilter: filterValues.sport,
    locationFilter: filterValues.location,
    priceRange: filterValues.priceRange,
    searchQuery: filterValues.searchQuery
  });

  const handleFilterChange = (newFilterValues: typeof filterValues) => {
    setFilterValues(newFilterValues);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SportyFiHeader />
      
      <main className="flex-grow">
        <div className="sportyfi-container py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold flex items-center">
              <MapPin className="mr-2 text-sportyfi-orange" size={28} />
              Sports Venues
            </h1>
            { (user && user.userType === 'USER') && <Link to="/venues/request">
              <Button className="bg-sportyfi-orange hover:bg-red-600 text-white">
                Request New Venue
              </Button>
            </Link> }
          </div>
          
          <VenueFilter onFilterChange={handleFilterChange} />
          
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-sportyfi-orange border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-lg">Loading venues...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-lg text-red-600">Error loading venues. Please try again later.</p>
            </div>
          ) : venues && venues.length === 0 ? (
            <div className="py-12 text-center">
              <Map className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-xl font-semibold mb-2">No venues found</p>
              <p className="text-gray-500">Try adjusting your filters or check back later for more options</p>
            </div>
          ) : venues ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {venues.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          ) : null}
        </div>
      </main>
      
      <NavigationButtons />
    </div>
  );
};

export default Venues;
