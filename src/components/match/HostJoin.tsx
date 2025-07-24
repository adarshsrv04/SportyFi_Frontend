
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type HostJoinProps = {
  onValueChange: (value: string) => void;
};

const HostJoin: React.FC<HostJoinProps> = ({ onValueChange }) => {
  return (
    <div>
      <Label htmlFor="hostJoin">Are you also playing *</Label>
      <Select 
        onValueChange={(value) => onValueChange(value)}
        required
      >
        <SelectTrigger id="hostJoin">
          <SelectValue placeholder="No" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="No">No</SelectItem>
          <SelectItem value="Yes">Yes</SelectItem>        
        </SelectContent>
      </Select>
    </div>
  );
};

export default HostJoin;
