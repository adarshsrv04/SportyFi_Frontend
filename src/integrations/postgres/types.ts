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

export type CreateMatch = {
    sport: string;
    location: string;
    matchTime: string; // or Date
    teamSize: number;
    availableSlots: number;
    skillLevel: string;
    description?: string;
    hostId: string;
};

export type CreateParticipant = {
    matchId: string;
    userId: string;
};