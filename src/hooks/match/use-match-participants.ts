
import { useState, useEffect } from 'react';
import { supabase, Match, Participant } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export type ParticipantWithProfile = Participant & {
  profile?: {
    username?: string | null;
    email?: string | null;
    avatar_url?: string | null;
    // bio?: string | null;
    // created_at?: string | null;
    // id?: string | null;
    // location?: string | null;
    // preferred_sports?: string[] | null;
    // primary_sport?: string | null;
    // role?: string | null;
    // updated_at?: string | null;
  };
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const useMatchParticipants = (match: Match | null, matchId: string | undefined) => {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<ParticipantWithProfile[]>([]);
  const [isJoinSuccess, setIsJoinSuccess] = useState(false);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);

  const fetchParticipants = async () => {
    if (!matchId) return;

    console.log("useMatchParticipants: Fetching participants");
    setIsLoadingParticipants(true);

    try {
      // ======================my code =====================
      let url = `${API_BASE_URL}/sportyfi/participants/${matchId}`;
      const response = await fetch(url);
      const participantsData: Participant[] = await response.json();
      // console.log(participantsData);
      // ------------------------------------

      // const { data: participantsData, error: participantsError } = await supabase
      //   .from('participants')
      //   .select('*')
      //   .eq('match_id', matchId);

      // if (participantsError) {
      //   console.error("Error fetching participants:", participantsError);
      //   return;
      // }

      console.log("Participants fetched:", participantsData);

      if (participantsData && participantsData.length > 0) {
        const enhancedParticipants: ParticipantWithProfile[] = [];

        for (const participant of participantsData) {
          try {
            // const data1 = await fetchUserProfile(participant.user_id);
            const profileData = await fetchUserProfile(participant.user_id);
            // console.log(profileData);
            // supabase
            //   .from('profiles')
            //   .select('username, avatar_url')
            //   .eq('id', participant.user_id)
            //   .maybeSingle();

            enhancedParticipants.push({
              ...participant,
              profile: {
                username: profileData?.username || null,
                avatar_url: profileData?.avatar_url || null
              }
            });
          } catch (err) {
            console.error("Error fetching profile for participant:", err);
            enhancedParticipants.push({
              ...participant,
              profile: { username: null, avatar_url: null }
            });
          }
        }

        setParticipants(enhancedParticipants);
      } else {
        setParticipants([]);
      }

      if (user && participantsData) {
        const userParticipating = participantsData.some(p => p.user_id === user.id);
        setIsJoinSuccess(userParticipating);
      }
    } catch (err) {
      console.error("Unexpected error fetching participants:", err);
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  const updateAvailableSlots = async (matchData: Match, participantCount: number) => {
    if (!matchData) return;

    const calculatedAvailableSlots = Math.max(0, matchData.team_size - participantCount);

    if (matchData.available_slots !== calculatedAvailableSlots) {
      console.log(`Updating available slots from ${matchData.available_slots} to ${calculatedAvailableSlots}`);

      // try {
      //   const { error: updateError } = await supabase
      //     .from('matches')
      //     .update({ available_slots: calculatedAvailableSlots })
      //     .eq('id', matchData.id);

      //   if (updateError) {
      //     console.error("Error updating available slots:", updateError);
      //   }
      // } catch (err) {
      //   console.error("Error in updateAvailableSlots:", err);
      // }
    }

    return calculatedAvailableSlots;
  };

  useEffect(() => {
    if (match) {
      fetchParticipants();
    }
  }, [matchId, match, user?.id]);

  useEffect(() => {
    if (user && participants.length >= 0) {
      const userIsParticipant = participants.some(p => p.user_id === user.id);
      if (isJoinSuccess !== userIsParticipant) {
        console.log(`Synchronizing join state: ${userIsParticipant ? 'User is participating' : 'User is not participating'}`);
        setIsJoinSuccess(userIsParticipant);
      }
    }
  }, [participants, user, isJoinSuccess]);

  return {
    participants,
    isJoinSuccess,
    updateAvailableSlots,
    fetchParticipants,
    isLoadingParticipants
  };
};

export async function fetchUserProfile(userId: string) {
  const response = await fetch(`${API_BASE_URL}/sportyfi/profiles/${userId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.statusText}`);
  }
  const profileData = await response.json();
  // console.log(profileData);
  return profileData;
}

export default useMatchParticipants;
