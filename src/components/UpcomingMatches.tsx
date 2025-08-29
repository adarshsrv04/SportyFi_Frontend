
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Match, supabase } from '@/integrations/supabase/client';

interface UpcomingMatchesProps {
  location: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UpcomingMatches = ({ location }: UpcomingMatchesProps) => {
  const [matches, setMatches] = useState<Match[]>([]);
  // console.log(location)
  // Mock data for upcoming matches
  // const matchesNearYou = [
  //   {
  //     id: 1,
  //     sportType: 'Football',
  //     title: 'Sunday Football Match',
  //     location: 'Mumbai',
  //     venue: 'Azad Maidan, Fort',
  //     date: 'Sun, Aug 13, 2023',
  //     time: '4:00 PM',
  //     slots: { filled: 8, total: 10 },
  //     skillLevel: 'Intermediate',
  //     host: 'Rahul S.',
  //   },
  //   {
  //     id: 2,
  //     sportType: 'Cricket',
  //     title: 'T20 Evening Match',
  //     location: 'Mumbai',
  //     venue: 'Shivaji Park, Dadar',
  //     date: 'Sat, Aug 12, 2023',
  //     time: '5:30 PM',
  //     slots: { filled: 15, total: 22 },
  //     skillLevel: 'Advanced',
  //     host: 'Priya K.',
  //   },
  //   {
  //     id: 3,
  //     sportType: 'Basketball',
  //     title: 'Weekend Basketball',
  //     location: 'Mumbai',
  //     venue: 'YMCA, Bandra',
  //     date: 'Sat, Aug 12, 2023',
  //     time: '6:00 PM',
  //     slots: { filled: 6, total: 10 },
  //     skillLevel: 'Beginner',
  //     host: 'Vikram R.',
  //   },
  //   {
  //     id: 4,
  //     sportType: 'Tennis',
  //     title: 'Doubles Tennis Match',
  //     location: 'Mumbai',
  //     venue: 'CCI Courts, Churchgate',
  //     date: 'Mon, Aug 14, 2023',
  //     time: '7:00 AM',
  //     slots: { filled: 3, total: 4 },
  //     skillLevel: 'Intermediate',
  //     host: 'Anjali M.',
  //   },
  //   {
  //     id: 5,
  //     sportType: 'Badminton',
  //     title: 'Morning Badminton Session',
  //     location: 'Hyderabad',
  //     venue: 'Gachibowli Stadium',
  //     date: 'Sun, Aug 13, 2023',
  //     time: '8:00 AM',
  //     slots: { filled: 2, total: 4 },
  //     skillLevel: 'Intermediate',
  //     host: 'Kiran T.',
  //   },
  //   {
  //     id: 6,
  //     sportType: 'Cricket',
  //     title: 'Weekend T10 Match',
  //     location: 'Hyderabad',
  //     venue: 'Uppal Stadium',
  //     date: 'Sat, Aug 19, 2023',
  //     time: '4:30 PM',
  //     slots: { filled: 12, total: 22 },
  //     skillLevel: 'Beginner',
  //     host: 'Suresh P.',
  //   },
  //   {
  //     id: 7,
  //     sportType: 'Basketball',
  //     title: 'Evening 3v3 Tournament',
  //     location: 'Hyderabad',
  //     venue: 'LB Stadium Courts',
  //     date: 'Fri, Aug 18, 2023',
  //     time: '6:00 PM',
  //     slots: { filled: 5, total: 12 },
  //     skillLevel: 'Advanced',
  //     host: 'Meera J.',
  //   },
  //   {
  //     id: 8,
  //     sportType: 'Tennis',
  //     title: 'Morning Tennis Practice',
  //     location: 'Hyderabad',
  //     venue: 'Sania Mirza Tennis Academy',
  //     date: 'Sun, Aug 20, 2023',
  //     time: '7:30 AM',
  //     slots: { filled: 2, total: 6 },
  //     skillLevel: 'Intermediate',
  //     host: 'Arjun D.',
  //   },
  // ];

  useEffect(() => {
    const loadMatches = async () => {
      const data = await fetchMatchByCity(location);
      setMatches(data);
    };
    loadMatches();
  }, [location]);

  // Filter matches by location
  const filteredMatches = matches.filter(match => match.city === location);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {filteredMatches.map((match) => (
        <Link to={`/matches/${match.id}`} key={match.id}>
          <Card className="sportyfi-card h-full hover:border-sportyfi-orange transition-colors overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 bg-sportyfi-orange text-white flex justify-between items-center">
                <h3 className="font-bold">{match.sport.charAt(0).toUpperCase() + match.sport.slice(1)}</h3>
                <Badge className="bg-white text-sportyfi-orange">{match.skill_level.charAt(0).toUpperCase() + match.skill_level.slice(1)}</Badge>
              </div>
              <div className="p-4">
                {/* <h3 className="font-bold text-lg mb-3">{match.title}</h3> */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-sportyfi-orange" />
                    <span>{match.location}, {match.city}</span>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="h-4 w-4 mr-2 mt-0.5 text-sportyfi-orange" />
                    <span>{new Date(match.match_time).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}</span>
                  </div>
                  <div className="flex items-start">
                    <Users className="h-4 w-4 mr-2 mt-0.5 text-sportyfi-orange" />
                    <span>
                      {(match.team_size - match.available_slots)}/{match.team_size} players joined
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Trophy className="h-4 w-4 mr-2 mt-0.5 text-sportyfi-orange" />
                    {/* <span>Hosted by {fetchHostProfile(match.host_id)}</span> */}
                    <HostInfo hostId={match.host_id} />
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 p-3 text-center">
                {match.available_slots === 0 ? (
                  <span className="text-gray-500 font-medium">Match Full</span>
                ) : (
                  <span className="text-sportyfi-orange font-medium">Join Match</span>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

// ====================my code ==================
const fetchMatchByCity = async (city: string) => {

  if (!city) return;

  try {
    let url = `${API_BASE_URL}/sportyfi/matches/city`;
    if (city) {
      url += `?city=${city}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch match: ${response.statusText}`);
    }
    const matches: Match[] = await response.json();
    // console.log(matches);
    if (matches) {
      return matches;
    }
  } catch (error) {
    console.error("Error fetching match by ID:", error);
    return [];
  }
  // --------------------------------------------
};

const fetchHostProfile = async (host_id: string) => {
  try {
    // const { data: profileData } = await supabase
    //   .from('profiles')
    //   .select('username, avatar_url, location')
    //   .eq('id', host_id)
    //   .maybeSingle();

    const response = await fetch(`${API_BASE_URL}/sportyfi/profiles/${host_id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }
    const profileData = await response.json();
    return profileData ? profileData.username : "Anonymous Host";
  } catch (err) {
    console.error("Error fetching profile for participant:", err);
    return "Anonymous Host";
  }
}

export default UpcomingMatches;

type HostInfoProps = {
  hostId: string;
};

export const HostInfo: React.FC<HostInfoProps> = ({ hostId }) => {
  const [hostName, setHostName] = useState<string>("");

  useEffect(() => {
    const getHostProfile = async () => {
      const name = await fetchHostProfile(hostId);
      setHostName(name);
    };

    getHostProfile();
  }, [hostId]);

  return <span>Hosted by {hostName}</span>;
};

