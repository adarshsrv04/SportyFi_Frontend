
import { useState, useEffect } from 'react';
import { supabase, Match } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile } from './use-match-participants';

export type Host = {
  id: string;
  username?: string;
  email?: string;
  avatar_url?: string;
};

export type FindMatch = {
  id: string;
  createdAt: string;
  sport: string;
  location: string;
  matchTime: string; // or Date
  teamSize: number;
  availableSlots: number;
  skillLevel: string;
  description?: string;
  hostId: string;
};

const useFetchMatch = (matchId: string | undefined) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [host, setHost] = useState<Host | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is logged in before submitting


  const fetchMatchData = async (forceRefresh = false) => {
    console.log('hello-- ', user)
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a match",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    if (!matchId) return;

    console.log(`useFetchMatch: Fetching match data${forceRefresh ? ' (forced refresh)' : ''}`);
    setIsLoading(true);
    setError(null);

    // ====================my code ==================
    try {
      let url = `http://localhost:8080/sportyfi/match/${matchId}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch match: ${response.statusText}`);
      }
      const matchDataNew: Match = await response.json();
      // console.log(matchDataNew);
      if (matchDataNew) {
        // const tempMatch: Match = {
        //   id: matchDataNew.id,
        //   created_at: matchDataNew.createdAt,
        //   sport: matchDataNew.sport,
        //   location: matchDataNew.location,
        //   match_time: matchDataNew.matchTime,
        //   team_size: matchDataNew.teamSize,
        //   available_slots: matchDataNew.availableSlots,
        //   skill_level: matchDataNew.skillLevel,
        //   description: matchDataNew.description || '',
        //   host_id: matchDataNew.hostId
        // };
        // console.log('------',tempMatch);
        setMatch(matchDataNew);
        setIsLoading(false);
      }
      if (matchDataNew.host_id) {
        console.log(matchDataNew.host_id)
        const hostData = await fetchUserProfile(matchDataNew.host_id);
        if (hostData) {
          setHost({
            id: matchDataNew.host_id,
            username: hostData.username || undefined,
            avatar_url: hostData.avatar_url || undefined
          });
        } else {
          setHost({
            id: match.host_id
          });
        }
      }
      return match;
    } catch (error) {
      console.error("Error fetching match by ID:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchMatchData();
  }, [matchId]);

  return {
    match,
    host,
    isLoading,
    error,
    fetchMatchData
  };
};

export default useFetchMatch;
