
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MatchCityFilterProps {
  selectedCity: string | null;
  allCities: string[];
  onCityChange: (city: string) => void;
}

const MatchCityFilter: React.FC<MatchCityFilterProps> = ({ 
  selectedCity, 
  allCities, 
  onCityChange 
}) => {
  return (
    <div className="w-full md:w-48">
      <Select 
        value={selectedCity || 'all'} 
        onValueChange={onCityChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter by sport" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Cities</SelectItem>
          {allCities.map(city => (
            <SelectItem key={city} value={city}>
              {city.charAt(0).toUpperCase() + city.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MatchCityFilter;
