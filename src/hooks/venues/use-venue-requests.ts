
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
// import type { VenueRequest } from '@/integrations/supabase/client';

/**
 * Hook for fetching venue requests
 */
// export const useVenueRequests = () => {
//   return useQuery({
//     queryKey: ['venue_requests'],
//     queryFn: async (): Promise<VenueRequest[]> => {
//       const { data, error } = await supabase
//         .from('venue_requests')
//         .select('*')
//         .order('created_at', { ascending: false });

//       if (error) {
//         console.error('Error fetching venue requests:', error);
//         throw new Error('Failed to fetch venue requests');
//       }

//       return data || [];
//     },
//   });
// };

/**
 * Form data interface for venue requests
 */
export interface VenueRequestFormData {
  name: string;
  description: string;
  location: string;
  pricePerHour: number;
  contactPhone: string;
  contactEmail: string;
  sports: string[];
  amenities: string[];
  images: File[];
}

/**
 * Hook for submitting new venue requests
 */
export const useSubmitVenueRequest = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: VenueRequestFormData) => {
      if (!user) {
        throw new Error("You must be logged in to submit a venue request");
      }
  
      const venueData = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        price_per_hour: formData.pricePerHour,
        contact_phone: formData.contactPhone,
        contact_email: formData.contactEmail,
        sports: formData.sports,
        amenities: formData.amenities,
        owner_id: user.id,
        status: "pending",
      };
  
      const { data, error } = await saveVenueRequest(venueData, formData.images);
  
      if (error) {
        console.error("Error submitting venue request:", error);
        throw new Error("Failed to submit venue request");
      }
  
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Venue request submitted",
        description: "Your request has been submitted and is pending approval",
      });
      queryClient.invalidateQueries({ queryKey: ["venue_requests"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit venue request",
        variant: "destructive",
      });
    },
  });
  

  // return useMutation({
  //   mutationFn: async (formData: VenueRequestFormData) => {

  //     if (!user) {
  //       throw new Error('You must be logged in to submit a venue request');
  //     }

  //     // const { data, error } = await supabase
  //     //   .from('venue_requests')
  //     //   .insert({
  //     //     name: formData.name,
  //     //     description: formData.description,
  //     //     location: formData.location,
  //     //     price_per_hour: formData.pricePerHour,
  //     //     contact_phone: formData.contactPhone,
  //     //     contact_email: formData.contactEmail,
  //     //     sports: formData.sports,
  //     //     amenities: formData.amenities,
  //     //     owner_id: user.id,
  //     //     status: 'pending'
  //     //   })
  //     //   .select()
  //     //   .single();

  //     const venueData = {
  //       name: formData.name,
  //       description: formData.description,
  //       location: formData.location,
  //       price_per_hour: formData.pricePerHour,
  //       contact_phone: formData.contactPhone,
  //       contact_email: formData.contactEmail,
  //       sports: formData.sports,
  //       amenities: formData.amenities,
  //       owner_id: user.id,
  //       // images: formData.images,
  //       status: 'pending'
  //     };

  //     const { data, error } = await saveVenueRequest(venueData);

  //     console.log(data);

  //     if (error) {
  //       console.error('Error saving venue:', error);
  //     } else {
  //       console.log('Venue saved:', data);
  //     }

  //     if (error) {
  //       console.error('Error submitting venue request:', error);
  //       throw new Error('Failed to submit venue request');
  //     }

  //     return data;
  //   },
  //   onSuccess: () => {
  //     toast({
  //       title: 'Venue request submitted',
  //       description: 'Your request has been submitted and is pending approval',
  //     });
  //     queryClient.invalidateQueries({ queryKey: ['venue_requests'] });
  //   },
  //   onError: (error) => {
  //     console.log(error)
  //     toast({
  //       title: 'Error1',
  //       description: error.message || 'Failed to submit venue request',
  //       variant: 'destructive',
  //     });
  //   }
  // });
};

export const saveVenueRequest = async (venueData: any, images: File[]) => {
  try {
    const formData = new FormData();

    // Append JSON as Blob so backend can map it to @RequestPart("venue")
    formData.append(
      "venue",
      new Blob([JSON.stringify(venueData)], { type: "application/json" })
    );

    // Append each file under "images"
    images.forEach((file) => {
      formData.append("images", file);
    });
    console.log(formData)
    const response = await fetch(
      "http://localhost:8080/sportyfi/venues/venue-request",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData, // no Content-Type header, browser sets boundary
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      return { data: null, error: errorData };
    }

    const data = await response.text();
    return { data, error: null };
  } catch (error: any) {
    console.error("Network error:", error);
    return { data: null, error: error.message || "Unknown error occurred" };
  }
};


// export const saveVenueRequest = async (venueData: any) => {
//   console.log(venueData.images)
//   try {
//     const response = await fetch('http://localhost:8080/sportyfi/venues/venue-request', {
//       method: 'POST',
//       headers: {
//         // 'Content-Type': 'application/json',
//         Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
//       },
//       body: JSON.stringify(venueData),
//     });
//     // const response = await axios.post(
//     //   'http://localhost:8080/sportyfi/venues/request',
//     //   formData,
//     //   {
//     //     headers: {
//     //       'Content-Type': 'application/json',
//     //       Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
//     //     },
//     //   }
//     // );
//     if (!response.ok) {
//       const errorData = await response.text(); // capture error message from server
//       return { data: null, error: errorData };
//     }

//     const data = await response.text(); // parse the successful response
//     return { data, error: null };
//   } catch (error: any) {
//     console.error('Network error:', error);
//     return { data: null, error: error.message || 'Unknown error occurred' };
//   }
// };
