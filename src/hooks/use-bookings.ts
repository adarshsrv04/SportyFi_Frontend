
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Booking, Venue } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export interface BookingFormData {
  venueId: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  notes?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Get all bookings for the current user
// export const useBookings = () => {
//   return useQuery({
//     queryKey: ['bookings'],
//     queryFn: async (): Promise<(Booking & { venue: Venue | null })[]> => {
//       const { data, error } = await supabase
//         .from('bookings')
//         .select(`
//           *,
//           venue:venues(*)
//         `)
//         .order('booking_date', { ascending: true });

//       if (error) {
//         console.error('Error fetching bookings:', error);
//         throw new Error('Failed to fetch bookings');
//       }

//       return data || [];
//     },
//   });
// };

export const useBookings = () => {
  // const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  console.log("API base:", import.meta.env.VITE_API_BASE_URL);

  const { user } = useAuth();
  const navigate = useNavigate();

  return useQuery({
    queryKey: ["bookings", user?.id],
    queryFn: async (): Promise<(Booking & { venue: Venue | null })[]> => {
      const response = await fetch(`${API_BASE_URL}/sportyfi/bookings/${user.id}`);
      // console.log(await response.json())
      return await response.json();
    },
    enabled: !!user,
  });
};

// Create a new booking
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (formData: BookingFormData) => {

      if (!user) {
        throw new Error('You must be logged in to book a venue');
      }

      // Fetch the venue to get price
      // const { data: venue, error: venueError } = await supabase
      //   .from('venues')
      //   .select('price_per_hour')
      //   .eq('id', formData.venueId)
      //   .single();

      // Fetch the venue to get price
      const response = await fetch(`${API_BASE_URL}/sportyfi/venues/${formData.venueId}`);
      const venue: Venue = await response.json();

      if (!venue) {
        throw new Error('Failed to fetch venue details');
      }

      // Calculate hours between start and end time
      const startHour = parseInt(formData.startTime.split(':')[0]);
      const startMinute = parseInt(formData.startTime.split(':')[1]);
      const endHour = parseInt(formData.endTime.split(':')[0]);
      const endMinute = parseInt(formData.endTime.split(':')[1]);

      const startTimeMinutes = startHour * 60 + startMinute;
      const endTimeMinutes = endHour * 60 + endMinute;
      const durationHours = (endTimeMinutes - startTimeMinutes) / 60;

      // Calculate total price
      const totalPrice = venue.price_per_hour * durationHours;

      // const { data, error } = await supabase
      //   .from('bookings')
      //   .insert({
      //     venue_id: formData.venueId,
      //     user_id: user.id,
      //     booking_date: formData.bookingDate.toISOString().split('T')[0],
      //     start_time: formData.startTime + ':00',
      //     end_time: formData.endTime + ':00',
      //     status: 'pending',
      //     total_price: totalPrice,
      //     notes: formData.notes || null
      //   })
      //   .select()
      //   .single();

      // if (error) {
      //   console.error('Error creating booking:', error);
      //   throw new Error('Failed to create booking');
      // }
      // console.log(user.user.id);
      const data = createBooking(formData, user, totalPrice, navigate);
      console.log(data);
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Booking request submitted, please make the payment!',
        description: 'Your booking request has been sent to the venue owner for confirmation.',
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response.data.error || 'Failed to create booking',
        variant: 'destructive',
      });
    }
  });
};

// Cancel a booking
export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  const { user, accessToken } = useAuth();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      // const { data, error } = await supabase
      //   .from('bookings')
      //   .update({ status: 'cancelled' })
      //   .eq('id', bookingId)
      //   .select()
      //   .single();

      // if (error) {
      //   console.error('Error cancelling booking:', error);
      //   throw new Error('Failed to cancel booking');
      // }

      console.log(accessToken)
      const data = await cancelBooking(bookingId, accessToken);
      console.log("Booking cancelled:", data);

      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Booking cancelled',
        description: 'Your booking has been cancelled successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel booking',
        variant: 'destructive',
      });
    }
  });
};

const createBooking = async (formData: any, user: any, totalPrice: number, navigate: (path: string) => void) => {
  try {
    console.log(formData.bookingDate)
    const bookingPayload = {
      venue_id: formData.venueId,
      user_id: user.id,
      booking_date: formData.bookingDate
        ? formData.bookingDate.toLocaleDateString("en-CA") // gives YYYY-MM-DD in local timezone
        : null,
      start_time: formData.startTime + ":00",
      end_time: formData.endTime + ":00",
      status: "pending",
      total_price: totalPrice,
      notes: formData.notes || null,
    };
    console.log((bookingPayload))
    const response = await axios.post(
      `${API_BASE_URL}/sportyfi/bookings/createBooking`,
      bookingPayload
    );

    console.log("Booking created:", response.data);
    navigate("/venuepayment", { state: { booking: response.data } });
    return response.data;
  } catch (error: any) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

const cancelBooking = async (bookingId: string, accessToken: string) => {
  try {
    console.log('accessToken---' + accessToken)
    const response = await axios.put(
      `${API_BASE_URL}/sportyfi/bookings/cancel/${bookingId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // get token from AuthContext
        },
      }
    );
    return response.data; // updated booking with status = "cancelled"
  } catch (error: any) {
    console.error("Error cancelling booking:", error);
    throw new Error(error.response?.data?.message || "Failed to cancel booking");
  }
};

