
import { useState, useEffect } from 'react';
import { Match, supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export interface ProfileData {
  id: string;
  username: string | null;
  avatar_url: string | null;
  role: string | null;
  bio: string | null;
  location: string | null;
  primary_sport: string | null;
  preferred_sports: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface PlayerStatsData {
  id: string;
  user_id: string;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  goals_scored: number;
  mvp_count: number;
  performance_rating: number;
  created_at: string;
  updated_at: string;
}

export interface AchievementData {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_name: string;
  description: string;
  icon: string;
  unlocked_at: string;
  created_at: string;
}

export interface MatchData {
  id: string;
  sport: string;
  location: string;
  match_time: string;
  team_size: number;
  available_slots: number;
  host_id: string;
  description: string | null;
  skill_level: string;
  created_at: string;
}

export const useProfileData = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStatsData | null>(null);
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState({
    profile: true,
    stats: true,
    achievements: true,
    matches: true
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchProfileData = async () => {
      try {
        // Fetch profile data
        // const { data: profileData, error: profileError } = await supabase
        //   .from('profiles')
        //   .select('*')
        //   .eq('id', user.id)
        //   .single();

        // if (profileError) throw profileError;
        // setProfile(profileData);
        // setLoading(prev => ({ ...prev, profile: false }));

        // --------------My code -----------------
        // const response = await fetch(`http://localhost:8080/sportyfi/profiles/${user.id}`);

        // if (!response.ok) {
        //   throw new Error(`Failed to fetch profile: ${response.statusText}`);
        // }
        // const profileData = await response.json();
        // console.log(profileData)
        setProfile(await fetchUserProfile(user.id));
        setLoading(prev => ({ ...prev, profile: false }));

        // ---------------------------------------------------------
        // Fetch player stats
        // const { data: statsData, error: statsError } = await supabase
        //   .from('player_stats')
        //   .select('*')
        //   .eq('user_id', user.id)
        //   .single();

        // if (statsError && statsError.code !== 'PGRST116') throw statsError;
        // setPlayerStats(statsData);
        // setLoading(prev => ({ ...prev, stats: false }));

        // Fetch achievements
        // const { data: achievementsData, error: achievementsError } = await supabase
        //   .from('player_achievements')
        //   .select('*')
        //   .eq('user_id', user.id)
        //   .order('unlocked_at', { ascending: false });

        // if (achievementsError) throw achievementsError;
        // setAchievements(achievements Data || []);
        // setLoading(prev => ({ ...prev, achievements: false }));

        // Fetch upcoming matches
        // const now = new Date().toISOString();
        // const { data: participationsData, error: participationsError } = await supabase
        //   .from('participants')
        //   .select('match_id')
        //   .eq('user_id', user.id);

        // if (participationsError) throw participationsError;

        // if (participationsData && participationsData.length > 0) {
        //   const matchIds = participationsData.map(p => p.match_id);

        // const { data: matchesData, error: matchesError } = await supabase
        //   .from('matches')
        //   .select('*')
        //   .in('id', matchIds)
        //   .gt('match_time', now)
        //   .order('match_time', { ascending: true });

        // if (matchesError) throw matchesError;
        // }
        // --------------------------My code--------------------
        const matchesData = await fetchUserMatches(user.id);

        setUpcomingMatches(matchesData || []);
        setLoading(prev => ({ ...prev, matches: false }));
      } catch (err: any) {
        console.error('Error fetching profile data:', err);
        setError(err.message);
        toast({
          title: "Error loading profile",
          description: "There was a problem loading your profile data",
          variant: "destructive",
        });
      } finally {
        setLoading({
          profile: false,
          stats: false,
          achievements: false,
          matches: false
        });
      }
    };

    fetchProfileData();
  }, [user]);

  const refreshProfileData = async () => {
    if (!user) return;

    setLoading({
      profile: true,
      stats: false,
      achievements: false,
      matches: false
    });

    try {
      // const { data, error } = await supabase
      //   .from('profiles')
      //   .select('*')
      //   .eq('id', user.id)
      //   .single();

      // if (error) throw error;
      setProfile(await fetchUserProfile(user.id));
    } catch (err: any) {
      console.error('Error refreshing profile data:', err);
      toast({
        title: "Error refreshing profile",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  return {
    profile,
    playerStats,
    achievements,
    upcomingMatches,
    loading,
    error,
    refreshProfileData
  };
};

export async function fetchUserMatches(userId: string): Promise<Match[] | null> {
  try {
    const url = `http://localhost:8080/sportyfi/matches/${userId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch matches: ${response.statusText}`);
    }

    const data: Match[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user matches:", error);
    return null;
  }
}

export async function fetchUserProfile(userId: string) {
  const response = await fetch(`http://localhost:8080/sportyfi/profiles/${userId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.statusText}`);
  }
  const profileData = await response.json();
  // console.log(profileData);
  return profileData;
}

// export async function fetchMatchParticipations(userId: string): Promise<Match[] | null> {
//   try {
//     const url = `http://localhost:8080/sportyfi/matches/${userId}`;
//     const response = await fetch(url);

//     if (!response.ok) {
//       throw new Error(`Failed to fetch matches: ${response.statusText}`);
//     }

//     const data: Participant[] = await response.json();
//     return data;
//   } catch (error) {
//     console.error("Error fetching user matches:", error);
//     return null;
//   }
// }
