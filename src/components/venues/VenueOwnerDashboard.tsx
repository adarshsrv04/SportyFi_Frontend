import React, { useEffect, useState } from "react";
import VenueBookingCard from "../venues/VenuesBookingCard";
import { useAuth } from "@/context/AuthContext";
import SportyFiHeader from "../SportyFiHeader";

type Booking = {
  booking_Id: string;
  venue_id: string;
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_price: number;
  venueName: string;
  owner_id: string;
  username: string;
  contact_phone: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const VenueOwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !user.id) return;

    const controller = new AbortController();
    setLoading(true);

    fetch(`${API_BASE_URL}/sportyfi/venueowners/bookings/${user.id}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data: Booking[]) => setBookings(data || []))
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load bookings");
          setBookings([]);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [user]);

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.booking_Id === bookingId ? { ...b, status: newStatus } : b
      )
    );
  };

  if (!user)
    return (
      <>
        <SportyFiHeader />
        <div className="p-6">Sign in to view owner dashboard.</div>
      </>
    );

  if (loading) return <div className="p-6">Loading bookings…</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (bookings.length === 0) return <div className="p-6">No bookings found.</div>;

  return (
    <>
      <SportyFiHeader />
      <div className="p-6 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {bookings.map((booking) => (
          <VenueBookingCard
            key={booking.booking_Id}
            booking={booking}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </>
  );
};

export default VenueOwnerDashboard;
