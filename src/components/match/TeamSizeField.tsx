
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '../ui/input';

type TeamSizeFieldProps = {
  onValueChange: (value: string) => void;
};

const TeamSizeField: React.FC<TeamSizeFieldProps> = ({ onValueChange }) => {
  const [selectedTeamSize, setSelectedTeamSize] = useState<string>("");
  const [customSize, setCustomSize] = useState<string>("");
  const handleSelectChange = (value: string) => {
    setSelectedTeamSize(value);
    if (value !== "custom") {
      onValueChange(value); // Directly send to parent
    } else {
      onValueChange(""); // Clear parent value until user types custom
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomSize(e.target.value);
    onValueChange(e.target.value); // Send custom value to backend
  };
  
  return (
    <div>
      <Label htmlFor="teamSize">Team Size *</Label>
      <Select 
        onValueChange={handleSelectChange} 
        required
      >
        <SelectTrigger id="teamSize">
          <SelectValue placeholder="Select team size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="2">2 players</SelectItem>
          <SelectItem value="3">3 players</SelectItem>
          <SelectItem value="5">5 players</SelectItem>
          <SelectItem value="6">6 players</SelectItem>
          <SelectItem value="11">11 players</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>

      {selectedTeamSize === "custom" && (
        <Input
          type="number"
          placeholder="Enter custom team size"
          value={customSize}
          onChange={handleCustomChange}
          required
        />
      )}
    </div>
  );
};

export default TeamSizeField;
