import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Mail, Users } from 'lucide-react';
import SportyFiHeader from '../SportyFiHeader';
import Footer from '../Footer';
import { supabase } from '@/integrations/supabase/client';

// 🆕 Define the correct shape of data from `venue_requests`
interface VenueRequest {
  id: string;
  location: string;
  price_per_hour: number | string;
  contact_email: string;
  status: string;
  created_at: string;
}

interface GroundVerification {
  id: string;
  location: string;
  priceperhour: string;
  match_time: string;
  status: string;
  contactemail: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const VerificationCard: React.FC = () => {
  const navigate = useNavigate();
  const [verifications, setVerifications] = useState<GroundVerification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerifications = async () => {
      setLoading(true);

      // const { data, error } = await supabase
      //   .from('venue_requests')
      //   .select('*');
      // //  console.log(data)
      // if (error) {
      //   console.error('Supabase fetch error:', error);
      //   setLoading(false);
      //   return;
      // }

      try {
        const response = await fetch(`${API_BASE_URL}/sportyfi/venues/requested-venues`);
        const data = await response.json()
        console.log(data)

        const formatted: GroundVerification[] = (data as VenueRequest[]).map((item) => ({
          id: item.id,
          location: item.location || 'Unknown',
          priceperhour: String(item.price_per_hour ?? '0'),
          match_time: item.created_at || new Date().toISOString(),
          team_size: 6, // optionally update if available
          status: item.status || 'pending',
          contactemail: item.contact_email || 'no-email@example.com',
        }));

        setVerifications(formatted);
        setLoading(false);
      } catch {

      }
    };


    fetchVerifications();
  }, []);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    verified: "bg-blue-100 text-blue-800"
  };

  return (
    <>
      <SportyFiHeader />
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-6 justify-center">
            {loading ? (
              <p className="text-gray-600">Loading venue requests...</p>
            ) : verifications.length === 0 ? (
              <p className="text-gray-600">No venue requests found.</p>
            ) : (
              verifications.map((venue) => (
                <div key={venue.id} className="w-full sm:w-96">
                  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold">Ground Verification Request</h3>
                      <Badge className={`${statusColors[venue.status] || 'bg-gray-100 text-gray-800'} text-xs font-medium px-2.5 py-0.5 rounded`}>
                        {venue.status.charAt(0).toUpperCase() + venue.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className="text-gray-700 flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                        {venue.location}
                      </p>
                      <p className="text-gray-700 flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                        {new Date(venue.match_time).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </p>
                      <p className="text-gray-700 flex items-center">
                        <Users className="h-4 w-4 mr-1 text-gray-500" />
                        ₹{venue.priceperhour}/hour
                      </p>
                      <p className="text-gray-700 flex items-center">
                        <Mail className="h-4 w-4 mr-1 text-gray-500" />
                        {venue.contactemail}
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate(`/verifyVenue/${venue.id}`)}
                      className="w-full bg-sportyfi-orange hover:bg-red-600 text-white"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default VerificationCard;