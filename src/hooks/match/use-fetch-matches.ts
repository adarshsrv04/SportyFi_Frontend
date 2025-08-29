
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase, Match } from '@/integrations/supabase/client';

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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Hook to fetch matches data from Supabase with optimized performance
 */
const useFetchMatches = (selectedSport: string | null) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchMatches = useCallback(async () => {
    // Cancel any in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    try {
      // ======================my code===================
      let url = `${API_BASE_URL}/sportyfi/matches`;
      if (selectedSport) {
        url += `?sport=${encodeURIComponent(selectedSport)}`;
      }
      const response = await fetch(url, { signal: abortController.signal });
      // console.log(response.json());
      // -------------------------------------------

      console.log('Fetching matches with filter:', selectedSport);
      // let query = supabase.from('matches').select('*');

      // Apply sport filter if selected
      // if (selectedSport) {
      //   query = query.eq('sport', selectedSport);
      // }

      // Sort by match time, most recent first
      // query = query.order('match_time', { ascending: true });

      // const { data, error: supabaseError } = await query;
      const data2 = await response.json(); // my code==================
      const matchDataNew: Match[] = data2;
      // console.log(matchDataNew);
      // console.log(data2);
      // If component unmounted or a new request started, don't update state
      if (!isMounted || abortController.signal.aborted) return;

      // if (supabaseError) {
      //   console.error("Error fetching matches:", supabaseError);
      //   setError("Failed to load matches. Please try again.");
      //   setMatches([]);
      //   return;
      // }
      // console.log("Matches fetched:", data?.length || 0);

      if (data2 === null) {
        setMatches([]);
      } else {
        // if (matchDataNew) {
        //   const tempMatch: Match[] = matchDataNew.map((item) => ({
        //     id: item.id,
        //     created_at: item.createdAt,
        //     sport: item.sport,
        //     location: item.location,
        //     match_time: item.matchTime,
        //     team_size: item.teamSize,
        //     available_slots: item.availableSlots,
        //     skill_level: item.skillLevel,
        //     description: item.description,
        //     host_id: item.hostId
        //   }));
        //   setMatches(tempMatch);
        // }
        setMatches(matchDataNew);
      }
    } catch (err) {
      // If component unmounted or a new request started, don't update state
      if (!isMounted || abortController.signal.aborted) return;

      console.error("Unexpected error fetching matches:", err);
      setError("An unexpected error occurred. Please try again.");
      setMatches([]);
    } finally {
      if (isMounted && !abortController.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [selectedSport]);

  return {
    matches,
    isLoading,
    error,
    fetchMatches
  };
};

export default useFetchMatches;
