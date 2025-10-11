import React, { useState } from "react";
import axios from "axios";

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

type BookingProps = {
  booking: Booking;
  onStatusChange: (bookingId: string, newStatus: string) => void;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const VenueBookingCard: React.FC<BookingProps> = ({ booking, onStatusChange }) => {
  const [updating, setUpdating] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | "approve" | "reject">(null);

  const updateBookingStatus = (bookingId: string, newStatus: string) => {
    setUpdating(true);
    axios
      .put(`${API_BASE_URL}/sportyfi/venueowners/bookings/${bookingId}/status`, {
        status: newStatus,
      })
      .then(() => {
        onStatusChange(bookingId, newStatus);
        setConfirmAction(null);
      })
      .catch((err) => {
        console.error("Error updating booking:", err);
        setUpdating(false);
      });
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-4 w-full max-w-md border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800">{booking.venueName}</h2>
      <p className="text-sm text-gray-500">Booking ID: {booking.booking_Id}</p>

      <div className="mt-3 space-y-1 text-sm">
        <p>
          <span className="font-medium text-gray-700">Booked By:</span>{" "}
          {booking.username} ({booking.contact_phone})
        </p>
        <p>
          <span className="font-medium text-gray-700">Date:</span>{" "}
          {booking.booking_date}
        </p>
        <p>
          <span className="font-medium text-gray-700">Time:</span>{" "}
          {booking.start_time} – {booking.end_time}
        </p>
        <p>
          <span className="font-medium text-gray-700">Status:</span>{" "}
          <span
            className={`px-2 py-1 rounded text-white ${
              booking.status === "pending"
                ? "bg-yellow-500"
                : booking.status === "approved"
                ? "bg-green-500"
                : "bg-red-500"
            }`}
          >
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </p>
        <p>
          <span className="font-medium text-gray-700">Total Price:</span> ₹
          {booking.total_price}
        </p>

        {/* Step 1: Show Approve/Reject buttons if pending */}
        {booking.status === "pending" && confirmAction === null && (
          <div className="mt-3 space-x-2">
            <button
              className="bg-green-500 text-white px-3 py-1 rounded"
              disabled={updating}
              onClick={() => setConfirmAction("approve")}
            >
              Approve
            </button>
            <button
              className="bg-red-500 text-white px-3 py-1 rounded"
              disabled={updating}
              onClick={() => setConfirmAction("reject")}
            >
              Reject
            </button>
          </div>
        )}

        {/* Step 2: Confirmation UI */}
        {confirmAction && (
          <div className="mt-4 p-3 border rounded bg-gray-50">
            <p className="text-sm text-gray-700 mb-3">
              {confirmAction === "approve"
                ? "Are you sure you want to approve? Please verify if the amount is paid before approving."
                : "Are you sure you want to reject this booking?"}
            </p>
            <div className="space-x-2">
              <button
                className={`px-3 py-1 rounded text-white ${
                  confirmAction === "approve" ? "bg-green-600" : "bg-red-600"
                } disabled:opacity-50`}
                disabled={updating}
                onClick={() =>
                  updateBookingStatus(
                    booking.booking_Id,
                    confirmAction === "approve" ? "approved" : "rejected"
                  )
                }
              >
                {updating
                  ? confirmAction === "approve"
                    ? "Approving…"
                    : "Rejecting…"
                  : confirmAction === "approve"
                  ? "Approve"
                  : "Reject"}
              </button>
              <button
                className="bg-gray-300 px-3 py-1 rounded"
                disabled={updating}
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VenueBookingCard;
