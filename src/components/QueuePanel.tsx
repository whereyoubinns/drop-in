import { useState, useEffect } from 'react';
import type { Player, CourtId } from '../types';
import { AddPlayerForm } from './AddPlayerForm';
import { formatClockTime } from '../utils/timeUtils';
import { useToast } from '../hooks/useToast';

interface QueuePanelProps {
  queue: Player[];
  court1Players: Player[];
  court2Players: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (playerId: string) => void;
  onAddPlayerToCourt: (courtId: CourtId, playerId: string) => void;
  onReorderQueue: (draggedPlayerId: string, targetPlayerId: string) => void;
  sessionDuration: number; // in minutes
}

export const QueuePanel = ({ queue, court1Players, court2Players, onAddPlayer, onRemovePlayer, onAddPlayerToCourt, onReorderQueue, sessionDuration }: QueuePanelProps) => {
  const { showToast } = useToast();
  const [, setTick] = useState(0);
  const [draggedOverId, setDraggedOverId] = useState<string | null>(null);
  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);
  const [recentlyMovedId, setRecentlyMovedId] = useState<string | null>(null);

  // Update every second for live time tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Clear the recently moved highlight after 2 seconds
  useEffect(() => {
    if (recentlyMovedId) {
      const timeout = setTimeout(() => {
        setRecentlyMovedId(null);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [recentlyMovedId]);

  const getNextCourt = (queuePosition: number): { courtId: CourtId; label: string; replacingPlayer?: Player } | null => {
    // Only show for the first person in queue
    if (queuePosition !== 0) {
      return null;
    }

    const court1HasSpace = court1Players.length < 3;
    const court2HasSpace = court2Players.length < 3;

    // If only one court has space, go there (no replacement, just filling empty spot)
    if (court1HasSpace && !court2HasSpace) {
      return { courtId: 'court1', label: 'Court 1 (right)' };
    }
    if (court2HasSpace && !court1HasSpace) {
      return { courtId: 'court2', label: 'Court 2 (left)' };
    }

    // If both courts have space OR both are full, determine by who's been on longest
    const allCourtPlayers = [...court1Players, ...court2Players];

    // If both courts are empty, default to Court 1
    if (allCourtPlayers.length === 0) {
      return { courtId: 'court1', label: 'Court 1 (right)' };
    }

    // Find which court has the player who's been on the longest
    const sortedPlayers = [...allCourtPlayers].sort((a, b) => (a.onCourtAt || 0) - (b.onCourtAt || 0));

    if (sortedPlayers.length > 0 && sortedPlayers[0].court) {
      const courtId = sortedPlayers[0].court;
      const label = courtId === 'court1' ? 'Court 1 (right)' : 'Court 2 (left)';

      // Only show replacing player if both courts are full
      const replacingPlayer = (court1HasSpace || court2HasSpace) ? undefined : sortedPlayers[0];

      return { courtId, label, replacingPlayer };
    }

    return null;
  };

  const getEstimatedTimeOn = (queuePosition: number): string | null => {
    // Calculate total available spots (max 3 per court = 6 total)
    const totalPlayers = court1Players.length + court2Players.length;
    const maxPlayers = 6; // 2 courts * 3 players each
    const availableSpots = maxPlayers - totalPlayers;

    // If this player's position is within available spots, they can go on now
    if (queuePosition < availableSpots) {
      return 'Now';
    }

    // Combine and sort all court players fresh each time
    const allCourtPlayers = [...court1Players, ...court2Players];
    const sortedCourtPlayers = allCourtPlayers.sort((a, b) => (a.onCourtAt || 0) - (b.onCourtAt || 0));

    if (sortedCourtPlayers.length === 0) {
      return 'Now';
    }

    // Adjust queue position by available spots since those people go on immediately
    const adjustedPosition = queuePosition - availableSpots;

    // Get the player who would come off for this queue position
    const playerComingOff = sortedCourtPlayers[adjustedPosition];

    if (!playerComingOff || !playerComingOff.onCourtAt) {
      return null;
    }

    // Calculate when they would reach the session time
    const sessionDurationMs = sessionDuration * 60 * 1000; // convert minutes to milliseconds
    const estimatedTime = playerComingOff.onCourtAt + sessionDurationMs;

    // If the estimated time is in the past (player is overtime), show "Now"
    if (estimatedTime <= Date.now()) {
      return 'Now';
    }

    return formatClockTime(estimatedTime);
  };

  return (
    <div className="queue-panel panel">
      <h2>Queue</h2>
      <div className="queue-count">
        {queue.length} {queue.length === 1 ? 'player' : 'players'} waiting
      </div>

      <AddPlayerForm onAddPlayer={onAddPlayer} />

      <div
        className={`player-list ${draggedPlayerId ? 'is-dragging' : ''}`}
        onDragLeave={(e) => {
          // Clear drag over state when leaving the list area
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDraggedOverId(null);
          }
        }}
      >
        {queue.length === 0 ? (
          <div className="empty-message">No players in queue</div>
        ) : (
          queue.map((player, index) => {
            const estimatedTime = getEstimatedTimeOn(index);
            const nextCourt = getNextCourt(index);

            const handleDragStart = (e: React.DragEvent) => {
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('playerId', player.id);
              e.dataTransfer.setData('source', 'queue');
              setDraggedPlayerId(player.id);
            };

            const handleDragEnd = () => {
              setDraggedPlayerId(null);
              setDraggedOverId(null);
            };

            const handleDragOver = (e: React.DragEvent) => {
              e.preventDefault();

              // Don't allow dropping on the item being dragged
              if (draggedPlayerId === player.id) {
                e.dataTransfer.dropEffect = 'none';
                return;
              }

              e.dataTransfer.dropEffect = 'move';

              // Only update state if it's different from current
              if (draggedOverId !== player.id) {
                setDraggedOverId(player.id);
              }
            };

            const handleDrop = (e: React.DragEvent) => {
              e.preventDefault();
              e.stopPropagation(); // Prevent event from bubbling to other queue items
              setDraggedOverId(null);

              const droppedPlayerId = e.dataTransfer.getData('playerId');
              const source = e.dataTransfer.getData('source');

              // Don't do anything if dropping on itself
              if (droppedPlayerId === player.id) {
                return;
              }

              // Only reorder if dragging within the queue and it's a different player
              if (source === 'queue' && droppedPlayerId) {
                onReorderQueue(droppedPlayerId, player.id);
                // Clear any previous animation and set new one
                setRecentlyMovedId(null);
                // Use setTimeout to ensure the animation resets properly
                setTimeout(() => {
                  setRecentlyMovedId(droppedPlayerId);
                }, 10);
              }
            };

            const handleAddToCourt = () => {
              if (!nextCourt) return;

              const courtPlayers = nextCourt.courtId === 'court1' ? court1Players : court2Players;

              if (courtPlayers.length >= 3) {
                showToast('Court is full! Maximum 3 players per court.', 'warning');
                return;
              }

              onAddPlayerToCourt(nextCourt.courtId, player.id);
            };

            const isDragging = draggedPlayerId === player.id;
            // Don't show drop zone on the item being dragged
            const isDraggedOver = draggedOverId === player.id && !isDragging;
            const isRecentlyMoved = recentlyMovedId === player.id;

            return (
              <div
                key={player.id}
                className={`queue-item ${isDraggedOver ? 'drag-over' : ''} ${isDragging ? 'dragging' : ''} ${isRecentlyMoved ? 'recently-moved' : ''}`}
                draggable
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="queue-item-left">
                  <span className="queue-position">#{index + 1}</span>
                  <div className="queue-player-details">
                    <div className="queue-player-name-row">
                      <span className="player-name">{player.name}</span>
                    </div>
                    {index === 0 && (
                      <div className="queue-player-badges">
                        <span className="next-badge">Next</span>
                        {nextCourt && (
                          <button
                            className="next-court-badge clickable"
                            onClick={handleAddToCourt}
                          >
                            → {nextCourt.label}
                          </button>
                        )}
                      </div>
                    )}
                    <div className="queue-player-times">
                      {estimatedTime && (
                        <span className="estimated-time">Est. on: {estimatedTime}</span>
                      )}
                      {nextCourt?.replacingPlayer && (
                        <span className="replacing-player">Replacing: {nextCourt.replacingPlayer.name}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onRemovePlayer(player.id)}
                  className="btn btn-small btn-secondary"
                >
                  × Remove
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
