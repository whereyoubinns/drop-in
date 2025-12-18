import { useState, useEffect } from 'react';
import type { Player } from '../types';
import { AddPlayerForm } from './AddPlayerForm';
import { formatDuration, formatClockTime } from '../utils/timeUtils';

interface QueuePanelProps {
  queue: Player[];
  court1Players: Player[];
  court2Players: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (playerId: string) => void;
}

export const QueuePanel = ({ queue, court1Players, court2Players, onAddPlayer, onRemovePlayer }: QueuePanelProps) => {
  const [, setTick] = useState(0);

  // Update every second for live time tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getWaitingTime = (joinedAt: number) => {
    return Date.now() - joinedAt;
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

    // Calculate when they would reach 20 minutes (session time)
    const sessionDuration = 20 * 60 * 1000; // 20 minutes in milliseconds
    const estimatedTime = playerComingOff.onCourtAt + sessionDuration;

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

      <div className="player-list">
        {queue.length === 0 ? (
          <div className="empty-message">No players in queue</div>
        ) : (
          queue.map((player, index) => {
            const waitingTime = getWaitingTime(player.joinedAt);
            const formattedTime = formatDuration(waitingTime);
            const estimatedTime = getEstimatedTimeOn(index);

            const handleDragStart = (e: React.DragEvent) => {
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('playerId', player.id);
            };

            return (
              <div
                key={player.id}
                className="queue-item"
                draggable
                onDragStart={handleDragStart}
              >
                <div className="queue-item-left">
                  <span className="queue-position">#{index + 1}</span>
                  <div className="queue-player-details">
                    <div className="queue-player-name-row">
                      <span className="player-name">{player.name}</span>
                      {index === 0 && <span className="next-badge">Next</span>}
                    </div>
                    <div className="queue-player-times">
                      <span className="waiting-time">Waiting: {formattedTime}</span>
                      {estimatedTime && (
                        <span className="estimated-time">Est. on: {estimatedTime}</span>
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
