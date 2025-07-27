
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase, Match } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ParticipantWithProfile } from './use-match-participants';
// import useFetchMatch from './use-fetch-match';

// =============================my code====================================
export type CreateParticipant = {
  match_id: string;
  user_id: string;
};
export const addParticipant = async (participant: CreateParticipant): Promise<void> => {
  try {
    const response = await fetch('http://localhost:8080/sportyfi/addParticipant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(participant),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error creating match:", errorData);
      throw new Error("Failed to create match");
    }

    const data = await response.json();
    console.log("participant added successfully:", data);

    // Example: trigger some UI state
    // setCreateSuccess(true); // assuming you manage this state elsewhere
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};

export const updateMatch = async (matchId: string, field: string, newValue: any): Promise<boolean> => {
  try {
    const response = await fetch(`http://localhost:8080/sportyfi/match/update/${matchId}/${field}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newValue)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error updating match:", errorData);
      throw new Error("Failed to update match");
    }

    const data = await response.json();
    console.log("Match updated successfully:", data);
    return true;
    // setCreateSuccess(true); // assuming you manage this state elsewhere
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};
// --------------------------------------------------------------

const useMatchActions = (
  match: Match | null,
  participants: ParticipantWithProfile[],
  fetchParticipants: () => Promise<void>,
  fetchMatchData: (forceRefresh?: boolean) => Promise<Match | null>
) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);
  const [isProcessingTransaction, setIsProcessingTransaction] = useState(false);
  // const [latestMatch, setLatestMatch] = useState<Match | null>(null);

  const performAtomicOperation = async (operation: () => Promise<void>) => {
    if (isProcessingTransaction) {
      console.log("Operation rejected - another transaction is in progress");
      toast({
        title: "Please wait",
        description: "Your previous request is still processing",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingTransaction(true);
    try {
      await operation();
    } finally {
      setTimeout(() => {
        setIsProcessingTransaction(false);
      }, 1000);
    }
  };

  const handleJoinMatch = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to join this match",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (!match) return;

    await performAtomicOperation(async () => {
      setIsJoining(true);

      try {
        if (participants.some(p => p.user_id === user.id)) {
          toast({
            title: "Already joined",
            description: "You are already a participant in this match.",
          });
          return;
        }
        const latestMatch: Match | null = await fetchMatch(match.id);
        console.log('---------', latestMatch);
        if (latestMatch) {
          if (latestMatch.available_slots <= 0) {
            toast({
              title: "Match is full",
              description: "Sorry, this match is already full.",
              variant: "destructive",
            });
            return;
          }
        }
        console.log("Starting join transaction");

        const participant: CreateParticipant = {
          match_id: match.id,
          user_id: user.id
        }
        try {
          await addParticipant(participant);
          // setCreateSuccess(true);
        } catch (err) {
          console.log("Something went wrong while creating the match");
        }

        console.log('-----latestmatch', latestMatch);
        const newAvailableSlots = Math.max(0, latestMatch.available_slots - 1);

        const updateMatchSlot = await updateMatch(match.id, 'available_slots', newAvailableSlots);

        if (!updateMatchSlot) {
          console.error("updating match slots:", updateMatchSlot);

          throw new Error("Could not update available slots");
        }

        toast({
          title: "Success!",
          description: "You've joined the match. See you there!",
        });

        await fetchParticipants();
        await fetchMatchData(true);

      } catch (error: any) {
        console.error("Error joining match:", error);
        toast({
          title: "Error",
          description: error.message || "There was an error joining the match. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsJoining(false);
      }
    });
  };

  const handleLeaveMatch = async () => {
    if (!user || !match) return;

    await performAtomicOperation(async () => {
      setIsJoining(true);

      try {
        const userParticipant = participants.find(p => p.user_id === user.id);
        if (!userParticipant) {
          toast({
            title: "Not a participant",
            description: "You are not participating in this match.",
            variant: "destructive",
          });
          return;
        }

        const matchId = match.id;
        console.log("Starting leave transaction");

        // ===========================my code=============================
        try {
          const response = await fetch(`http://localhost:8080/sportyfi/deleteParticipant/${userParticipant.id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to delete participant: ${response.statusText}`);
          }

          console.log("Participant deleted successfully");
        } catch (error) {
          console.error("Error deleting participant:", error);
        }
        const latestMatch: Match | null = await fetchMatch(match.id);
        const newAvailableSlots = Math.min(latestMatch.available_slots + 1, match.team_size);
        const updateMatchSlot = await updateMatch(match.id, 'available_slots', newAvailableSlots);

        if (!updateMatchSlot) {
          console.error("Error updating match slots:", updateMatchSlot);
          throw new Error("Could not update available slots");
        }

        toast({
          title: "You've left the match",
          description: "You are no longer participating in this match.",
        });

        await fetchParticipants();
        await fetchMatchData(true);

      } catch (error: any) {
        console.error("Error leaving match:", error);
        toast({
          title: "Error",
          description: error.message || "There was an error leaving the match. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsJoining(false);
      }
    });
  };

  const userIsParticipant = user && participants.some(p => p.user_id === user.id);
  const matchIsFull = match ? match.available_slots <= 0 : false;
  const isHost = user && match && user.id === match.host_id;

  return {
    isJoining: isJoining || isProcessingTransaction,
    userIsParticipant,
    matchIsFull,
    isHost,
    handleJoinMatch,
    handleLeaveMatch
  };
};

export default useMatchActions;

import { useEffect } from "react";


const fetchMatch = async (matchId) => {
  try {
    let url = `http://localhost:8080/sportyfi/match/${matchId}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch match: ${response.statusText}`);
    }

    const matchDataNew: Match = await response.json();
    // setLatestMatch(matchDataNew); // triggers re-render
    return matchDataNew;
  } catch (error) {
    console.error("Error fetching match:", error);
    return null;
  }
};
