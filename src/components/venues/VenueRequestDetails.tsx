import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Mail, Phone } from 'lucide-react';
import SportyFiHeader from '../SportyFiHeader';
import Footer from '../Footer';
import { supabase } from '@/integrations/supabase/client';
import axios from 'axios';

interface VenueDetailsData {
    id: string;
    name: string;
    location: string;
    description: string;
    price_per_hour: number;
    amenities: string[];
    sports: string[];
    contact_email: string;
    contact_phone: string;
    status: string;
    created_at: string;
}

const VenueRequestDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [venue, setVenue] = useState<VenueDetailsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchVenue = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:8080/sportyfi/venues/verification/${id}`);
                const data = await response.json()
                console.log(data);
                // const { data, error } = await supabase
                //     .from('venue_requests')
                //     .select('*')
                //     .eq('id', id)
                //     .single();

                // if (error) {
                //     console.error('Error fetching venue:', error);
                // } else {
                //     setVenue(data as VenueDetailsData);
                // }
                setVenue(data as VenueDetailsData);
                setLoading(false);
            } catch {

            }
        };

        if (id) fetchVenue();
    }, [id]);

    const updateStatus = async (newStatus: 'approved' | 'rejected') => {
        if (!venue) return;
        setUpdating(true);
        const { error } = await supabase
            .from('venue_requests')
            .update({ status: newStatus })
            .eq('id', venue.id);

        if (!error) {
            setVenue({ ...venue, status: newStatus });
        } else {
            console.error('Status update error:', error);
        }
        setUpdating(false);
    };

    type VenueRequestProps = {
        requestId: number;
    };

    const approveVenue = async () => {
        try {
            const response = await axios.post(`/sportyfi/venues/approve/${id}`);
            alert("Venue approved successfully!");
            console.log("Approved Venue:", response.data);
        } catch (error) {
            console.error("Error approving venue:", error);
            alert("Failed to approve venue");
        }
    };

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        verified: 'bg-blue-100 text-blue-800'
    };

    return (
        <>
            <SportyFiHeader />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4">
                <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-6">
                    {loading ? (
                        <p className="text-center text-gray-600">Loading venue details...</p>
                    ) : !venue ? (
                        <p className="text-center text-red-500">Venue not found.</p>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <h1 className="text-3xl font-bold text-gray-900">{venue.name}</h1>
                                <Badge className={`${statusColors[venue.status] || 'bg-gray-200 text-gray-800'} px-3 py-1 text-sm`}>
                                    {venue.status.charAt(0).toUpperCase() + venue.status.slice(1)}
                                </Badge>
                            </div>

                            {/* Description */}
                            <p className="text-gray-700 leading-relaxed">{venue.description}</p>

                            {/* Venue Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
                                <div className="flex items-center">
                                    <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                                    <span>{venue.location}</span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                                    <span>{new Date(venue.created_at).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center">
                                    <Mail className="w-5 h-5 mr-2 text-gray-500" />
                                    <span>{venue.contact_email}</span>
                                </div>
                                <div className="flex items-center">
                                    <Phone className="w-5 h-5 mr-2 text-gray-500" />
                                    <span>{venue.contact_phone}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="font-semibold mr-2">Price/hr:</span>
                                    ₹{venue.price_per_hour}
                                </div>
                            </div>

                            {/* Amenities */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Amenities</h3>
                                <div className="flex flex-wrap gap-2">
                                    {venue.amenities.map((amenity) => (
                                        <Badge key={amenity} className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm">
                                            {amenity}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Sports */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Supported Sports</h3>
                                <div className="flex flex-wrap gap-2">
                                    {venue.sports.map((sport) => (
                                        <Badge key={sport} className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm">
                                            {sport}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4">
                                <Button
                                    variant="outline"
                                    className="border-green-500 text-green-600 hover:bg-green-50 w-full"
                                    onClick={approveVenue}
                                    disabled={venue.status === 'approved' || updating}
                                >
                                    Approve11
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-red-500 text-red-600 hover:bg-red-50 w-full"
                                    onClick={() => updateStatus('rejected')}
                                    disabled={venue.status === 'rejected' || updating}
                                >
                                    Decline
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default VenueRequestDetails;