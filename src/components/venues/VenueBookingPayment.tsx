import { useLocation } from "react-router-dom";
import QRCode from "react-qr-code";

const PaymentPage = () => {
  const location = useLocation();
  const { booking } = location.state || {};

  if (!booking) {
    return <p>No booking found. Please try again.</p>;
  }

  const upiId = "9883513680@ybl"; // replace with actual owner UPI
  const payeeName = "Jayanta Saha";
  const amount = booking.total_price;

  // Create UPI Payment String (UPI QR format)
  const upiString = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&cu=INR`;

  return (
    <div className="max-w-lg mx-auto p-6 shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Payment </h2>

      <div className="mb-4">
        <p><b>Date:</b> {booking.booking_date}</p>
        <p><b>Time:</b> {booking.start_time} - {booking.end_time}</p>
        <p><b>Total Price:</b> ₹{amount}</p>
        <p><b>Status:</b> {booking.status}</p>
      </div>

      <div className="flex flex-col items-center">
        <p className="mb-2">Scan the QR code to pay:</p>
        <QRCode value={upiString} size={200} />
        <p className="mt-2 text-sm">Pay to: <b>{payeeName}</b></p>
        <p className="text-sm">UPI ID: <b>{upiId}</b></p>
      </div>

      <div className="mt-6">
        <p className="text-gray-600 text-sm">
          After payment, your booking will remain <b>PENDING</b> until the venue owner confirms it.
        </p>
      </div>
    </div>
  );
};

export default PaymentPage;
