// Type definitions for the Squash Drop-In Court Manager

export type CourtId = "court1" | "court2";

export interface Player {
  id: string;
  name: string;
  joinedAt: number;        // timestamp when added to the queue
  onCourtAt?: number;      // timestamp when placed on a court
  court?: CourtId;
}

export interface Court {
  id: CourtId;
  players: Player[];       // max length = 3
}

export interface AppState {
  court1: Player[];
  court2: Player[];
  waitingQueue: Player[];
}
