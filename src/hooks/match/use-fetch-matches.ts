
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
      let url = 'http://localhost:8080/sportyfi/matches';
      if (selectedSport) {
        url += `?sport=${encodeURIComponent(selectedSport)}`;
      }
      const response = await fetch(url, { signal: abortController.signal });
      // console.log(response.json());
      console.log('Fetching matches with filter:', selectedSport);
      const data2 = await response.json(); // my code==================
      const matchDataNew: Match[] = data2;
      // console.log(matchDataNew);
      // If component unmounted or a new request started, don't update state
      if (!isMounted || abortController.signal.aborted) return;

      if (data2 === null) {
        setMatches([]);
      } else {
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
