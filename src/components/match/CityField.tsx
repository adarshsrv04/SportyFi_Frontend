
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type CityFieldProps = {
  onValueChange: (value: string) => void;
};

const CityField: React.FC<CityFieldProps> = ({ onValueChange }) => {
  return (
    <div>
      <Label htmlFor="city">Game City *</Label>
      <Select 
        onValueChange={(value) => onValueChange(value)}
        required
      >
        <SelectTrigger id="city">
          <SelectValue placeholder="Select City" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Mumbai">Mumbai</SelectItem>
          <SelectItem value="Chennai">Chennai</SelectItem>
          <SelectItem value="Hydrabad">Hydrabad</SelectItem>
          <SelectItem value="Kolkata">Kolkata</SelectItem>
          <SelectItem value="Bangalore">Bangalore</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CityField;
