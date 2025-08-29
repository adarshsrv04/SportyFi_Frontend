
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Match, supabase } from '@/integrations/supabase/client';

// Define the form data structure
export interface MatchFormData {
  sport: string;
  location: string;
  city: string;
  date: Date | null;
  time: string;
  teamSize: string;
  hostJoin: any;
  description: string;
  skillLevel: string;
}

// Initial form state
export const initialFormData: MatchFormData = {
  sport: '',
  location: '',
  city: '',
  date: null,
  time: '',
  teamSize: '',
  hostJoin: '',
  description: '',
  skillLevel: 'all',
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useCreateMatchForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [formData, setFormData] = useState<MatchFormData>(initialFormData);
  
  // Input change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Select change handler
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Date change handler
  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({ ...prev, date }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is logged in before submitting
    // if (!user) {
    //   toast({
    //     title: "Authentication required",
    //     description: "Please log in to create a match",
    //     variant: "destructive",
    //   });
    //   navigate('/auth');
    //   return;
    // }
    
    // Validate form
    if (!formData.sport || !formData.location || !formData.city || !formData.date || !formData.time || !formData.teamSize) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Combine date and time
      const dateTime = new Date(formData.date!);
      const [hours, minutes] = formData.time.split(':').map(Number);
      dateTime.setHours(hours, minutes);

      // =============my changes================ //
      const match = {
        sport: formData.sport,
        location: formData.location,
        city: formData.city,
        match_time: dateTime.toISOString(),
        team_size: parseInt(formData.teamSize),
        host_join: formData.hostJoin,
        available_slots: parseInt(formData.teamSize),
        skill_level: formData.skillLevel,
        description: formData.description,
        host_id: user.id
        // id and createdAt can be omitted if generated on backend'
      };

      try {
        await createMatch(match);
        // setCreateSuccess(true);
      } catch (err) {
        setError("Something went wrong while creating the match");
      }
    // -------------------------------
      
      console.log("Submitting match data:", {
        sport: formData.sport,
        location: formData.location,
        match_time: dateTime.toISOString(),
        team_size: parseInt(formData.teamSize),
        available_slots: parseInt(formData.teamSize),
        skill_level: formData.skillLevel,
        description: formData.description,
        host_id: user.id
      });
      
      // Store in Supabase
      // const { data, error } = await supabase
      //   .from('matches')
      //   .insert([
      //     {
      //       sport: formData.sport,
      //       location: formData.location,
      //       match_time: dateTime.toISOString(),
      //       team_size: parseInt(formData.teamSize),
      //       available_slots: parseInt(formData.teamSize),
      //       skill_level: formData.skillLevel,
      //       description: formData.description,
      //       host_id: user.id
      //     }
      //   ])
      //   .select();
      
      // if (error) {
      //   console.error("Error creating match:", error);
      //   throw error;
      // }
      
      // console.log("Match created successfully:", data);
      
      // Set success state first
      setCreateSuccess(true);
      
      // Show success message
      toast({
        title: "Match created successfully!",
        description: "Your match has been added to the listings.",
      });
      
      // Save current form data to use in navigation
      const sportFilter = formData.sport;
      
      // Clear form data
      // setFormData(initialFormData);
      
      // Delay navigation slightly to allow the user to see the success message
      setTimeout(() => {
        setIsSubmitting(false);
        navigate(`/matches?sport=${sportFilter}`);
      }, 1500);
      
    } catch (error: any) {
      setIsSubmitting(false);
      console.error("Error creating match:", error);
      toast({
        title: "Error",
        description: error.message || "There was an error creating your match. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return {
    formData,
    isSubmitting,
    createSuccess,
    handleChange,
    handleSelectChange,
    handleDateChange,
    handleSubmit,
    user
  };
};
function setError(arg0: string) {
  throw new Error('Function not implemented.');
}

// ============================my code =============================
// export type CreateMatchType = Omit<Match, 'id' | 'created_at'>;
export const createMatch = async (match: any): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sportyfi/createMatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(match),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error creating match:", errorData);
      throw new Error("Failed to create match");
    }

    const data = await response.json();
    console.log("Match created successfully:", data);

    // Example: trigger some UI state
    // setCreateSuccess(true); // assuming you manage this state elsewhere
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};
// -----------------------------------------------------------