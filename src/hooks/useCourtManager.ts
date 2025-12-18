import { useState, useEffect, useCallback } from 'react';
import type { Player, CourtId, AppState } from '../types';
import { useToast } from './useToast';

const STORAGE_KEY = 'squash-court-manager-state';
const MAX_PLAYERS_PER_COURT = 3;

// Load state from localStorage
const loadState = (): AppState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load state:', error);
  }
  return {
    court1: [],
    court2: [],
    waitingQueue: [],
  };
};

// Save state to localStorage
const saveState = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
};

export const useCourtManager = () => {
  const [state, setState] = useState<AppState>(loadState);
  const { showToast } = useToast();

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Add a new player to the waiting queue
  const addPlayer = useCallback((name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    // Check for duplicate names
    const allPlayers = [
      ...state.court1,
      ...state.court2,
      ...state.waitingQueue,
    ];
    const nameExists = allPlayers.some(
      p => p.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (nameExists) {
      showToast('A player with this name is already active!', 'warning');
      return;
    }

    const newPlayer: Player = {
      id: `${Date.now()}-${Math.random()}`,
      name: trimmedName,
      joinedAt: Date.now(),
    };

    setState(prev => ({
      ...prev,
      waitingQueue: [...prev.waitingQueue, newPlayer],
    }));
  }, [state]);

  // Remove a player from queue
  const removeFromQueue = useCallback((playerId: string) => {
    setState(prev => ({
      ...prev,
      waitingQueue: prev.waitingQueue.filter(p => p.id !== playerId),
    }));
  }, []);

  // Add a player from queue to a court
  const addToCourt = useCallback((courtId: CourtId) => {
    setState(prev => {
      const court = prev[courtId];

      if (court.length >= MAX_PLAYERS_PER_COURT) {
        showToast('Court is full! Maximum 3 players per court.', 'warning');
        return prev;
      }

      if (prev.waitingQueue.length === 0) {
        showToast('No players in queue!', 'warning');
        return prev;
      }

      const nextPlayer = prev.waitingQueue[0];
      const updatedPlayer: Player = {
        ...nextPlayer,
        court: courtId,
        onCourtAt: Date.now(),
      };

      return {
        ...prev,
        [courtId]: [...court, updatedPlayer],
        waitingQueue: prev.waitingQueue.slice(1),
      };
    });
  }, []);

  // Add a specific player from queue or another court (for drag and drop)
  const addSpecificPlayerToCourt = useCallback((courtId: CourtId, playerId: string) => {
    setState(prev => {
      const court = prev[courtId];

      if (court.length >= MAX_PLAYERS_PER_COURT) {
        showToast('Court is full! Maximum 3 players per court.', 'warning');
        return prev;
      }

      // Check if player is in queue
      let player = prev.waitingQueue.find(p => p.id === playerId);
      let fromQueue = true;
      let fromCourt: CourtId | null = null;

      // If not in queue, check if they're on a court
      if (!player) {
        player = prev.court1.find(p => p.id === playerId);
        if (player) {
          fromQueue = false;
          fromCourt = 'court1';
        }
      }

      if (!player) {
        player = prev.court2.find(p => p.id === playerId);
        if (player) {
          fromQueue = false;
          fromCourt = 'court2';
        }
      }

      if (!player) {
        return prev;
      }

      const updatedPlayer: Player = {
        ...player,
        court: courtId,
        onCourtAt: player.onCourtAt || Date.now(), // Keep existing time if moving between courts
      };

      // Build the new state
      const newState: any = {
        ...prev,
        [courtId]: [...court, updatedPlayer],
      };

      // Remove from source
      if (fromQueue) {
        newState.waitingQueue = prev.waitingQueue.filter(p => p.id !== playerId);
      } else if (fromCourt) {
        newState[fromCourt] = prev[fromCourt].filter(p => p.id !== playerId);
      }

      return newState;
    });
  }, []);

  // Remove a specific player from a court
  const removeFromCourt = useCallback((courtId: CourtId, playerId: string) => {
    setState(prev => {
      const court = prev[courtId];
      const player = court.find(p => p.id === playerId);

      if (!player) return prev;

      // Remove court-specific data
      const updatedPlayer: Player = {
        ...player,
        court: undefined,
        onCourtAt: undefined,
        joinedAt: Date.now(), // Reset joined time for queue
      };

      return {
        ...prev,
        [courtId]: court.filter(p => p.id !== playerId),
        waitingQueue: [...prev.waitingQueue, updatedPlayer],
      };
    });
  }, []);

  // Remove the next player (longest on court) from a specific court
  const removeNextPlayer = useCallback((courtId: CourtId) => {
    setState(prev => {
      const court = prev[courtId];

      if (court.length === 0) {
        showToast('Court is empty!', 'warning');
        return prev;
      }

      // Find player who has been on court the longest
      const sortedPlayers = [...court].sort((a, b) =>
        (a.onCourtAt || 0) - (b.onCourtAt || 0)
      );
      const nextOff = sortedPlayers[0];

      // Send player back to queue
      const updatedPlayer: Player = {
        ...nextOff,
        court: undefined,
        onCourtAt: undefined,
        joinedAt: Date.now(),
      };

      return {
        ...prev,
        [courtId]: court.filter(p => p.id !== nextOff.id),
        waitingQueue: [...prev.waitingQueue, updatedPlayer],
      };
    });
  }, []);

  // Clear a court completely
  const clearCourt = useCallback((courtId: CourtId) => {
    if (!confirm(`Clear all players from ${courtId === 'court1' ? 'Court 1' : 'Court 2'}?`)) {
      return;
    }

    setState(prev => {
      const court = prev[courtId];

      // Send all players back to queue
      const playersBackToQueue = court.map(player => ({
        ...player,
        court: undefined,
        onCourtAt: undefined,
        joinedAt: Date.now(),
      }));

      return {
        ...prev,
        [courtId]: [],
        waitingQueue: [...prev.waitingQueue, ...playersBackToQueue],
      };
    });
  }, []);

  // One-click rotate: remove next off and fill from queue
  const rotateCourt = useCallback((courtId: CourtId) => {
    setState(prev => {
      const court = prev[courtId];

      if (court.length === 0) {
        // Just add from queue if court is empty
        if (prev.waitingQueue.length === 0) return prev;

        const nextPlayer = prev.waitingQueue[0];
        const updatedPlayer: Player = {
          ...nextPlayer,
          court: courtId,
          onCourtAt: Date.now(),
        };

        return {
          ...prev,
          [courtId]: [updatedPlayer],
          waitingQueue: prev.waitingQueue.slice(1),
        };
      }

      // Find player who has been on court the longest
      const sortedPlayers = [...court].sort((a, b) =>
        (a.onCourtAt || 0) - (b.onCourtAt || 0)
      );
      const nextOff = sortedPlayers[0];

      // Remove them from court
      const remainingPlayers = court.filter(p => p.id !== nextOff.id);

      // Send removed player back to queue
      const playerBackToQueue: Player = {
        ...nextOff,
        court: undefined,
        onCourtAt: undefined,
        joinedAt: Date.now(),
      };

      let newCourt = remainingPlayers;
      let newQueue = [...prev.waitingQueue, playerBackToQueue];

      // Add from queue if space available and queue not empty
      if (remainingPlayers.length < MAX_PLAYERS_PER_COURT && prev.waitingQueue.length > 0) {
        const nextPlayer = prev.waitingQueue[0];
        const updatedPlayer: Player = {
          ...nextPlayer,
          court: courtId,
          onCourtAt: Date.now(),
        };
        newCourt = [...remainingPlayers, updatedPlayer];
        newQueue = [playerBackToQueue, ...prev.waitingQueue.slice(1)];
      }

      return {
        ...prev,
        [courtId]: newCourt,
        waitingQueue: newQueue,
      };
    });
  }, []);

  // Clear the queue
  const clearQueue = useCallback(() => {
    if (!confirm('Clear all players from the queue?')) {
      return;
    }

    setState(prev => ({
      ...prev,
      waitingQueue: [],
    }));
  }, []);

  // Clear all data
  const clearAll = useCallback(() => {
    if (!confirm('Clear all players and reset the app?')) {
      return;
    }

    const emptyState: AppState = {
      court1: [],
      court2: [],
      waitingQueue: [],
    };
    setState(emptyState);
  }, []);

  return {
    state,
    addPlayer,
    removeFromQueue,
    addToCourt,
    addSpecificPlayerToCourt,
    removeFromCourt,
    removeNextPlayer,
    clearCourt,
    rotateCourt,
    clearQueue,
    clearAll,
  };
};
