
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import UpcomingMatches from '@/components/UpcomingMatches';
import { PlayCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { ProfileData } from '@/hooks/use-profile-data';

const MatchesSection = () => {
  const { user } = useAuth();
  const [location, setLocation] = useState('Mumbai');
  // console.log(user)

  useEffect(() => {
    const fetchUserLocation = async () => {
      // console.log(user)
      if (user) {
        // const { data: profileData, error: profileError } = await supabase
        //   .from('profiles')
        //   .select('location')
        //   .eq('id', user.id)
        //   .single();
    
        // if (profileError) throw profileError;
        // console.log(profileData)
        const response = await fetch(`http://localhost:8080/sportyfi/profiles/${user.id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.statusText}`);
        }
        const profileData = await response.json();
        if(profileData !== null && profileData.location !== null) {        
          // console.log(profileData.location);
          setLocation(profileData.location);
        }
      }
    }
    fetchUserLocation();
  }, [user]);

  return (
    <section className="py-16 bg-gray-50">
      <div className="sportyfi-container">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Matches Near You</h2>
          <div className="flex items-center mt-4 md:mt-0">
            <span className="mr-2">Location:</span>
            <select value={location} onChange={e => setLocation(e.target.value)} className="border rounded-md px-3 py-1">
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Chennai">Chennai</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Kolkata">Kolkata</option>
            </select>
          </div>
        </div>
        <UpcomingMatches location={location} />
        <div className="text-center mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/matches">
            <Button variant="outline" className="border-sportyfi-orange text-sportyfi-orange hover:bg-sportyfi-orange hover:text-white">
              See All Matches
            </Button>
          </Link>
          <Link to="/watch">
            <Button className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2">
              <PlayCircle size={16} />
              Watch Live Matches
              <span className="bg-white text-red-500 text-xs px-1.5 py-0.5 rounded-full">Live</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MatchesSection;
