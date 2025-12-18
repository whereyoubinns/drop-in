import { useState, useEffect } from 'react';
import type { Player } from '../types';
import { formatDuration, getTimeOnCourt, getTimeStatus, formatClockTime } from '../utils/timeUtils';

interface PlayerCardProps {
  player: Player;
  isNextOff: boolean;
  onRemove: () => void;
  courtId?: string;
}

export const PlayerCard = ({ player, isNextOff, onRemove, courtId }: PlayerCardProps) => {
  const [, setTick] = useState(0);

  // Update every second for live time tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const timeOnCourt = getTimeOnCourt(player.onCourtAt);
  const timeStatus = getTimeStatus(timeOnCourt);
  const formattedTime = formatDuration(timeOnCourt);

  // Calculate estimated time off (20 minutes from when they went on)
  const sessionDuration = 20 * 60 * 1000; // 20 minutes in milliseconds
  const estimatedTimeOff = player.onCourtAt ? formatClockTime(player.onCourtAt + sessionDuration) : null;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('playerId', player.id);
    if (courtId) {
      e.dataTransfer.setData('sourceCourt', courtId);
    }
  };

  return (
    <div
      className={`player-card ${timeStatus} ${isNextOff ? 'next-off' : ''}`}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="player-card-content">
        <div className="player-card-info">
          <div className="player-card-header">
            <span className="player-name">{player.name}</span>
          </div>

          <div className="player-card-details">
            <div className="player-badges">
              {isNextOff && <span className="badge next-off-badge">⏳ Next Off</span>}
              {timeStatus === 'overtime' && <span className="badge overtime-badge">🔴 Overtime</span>}
            </div>
            {estimatedTimeOff && (
              <span className="estimated-time-off">Est. off: {estimatedTimeOff}</span>
            )}
          </div>
        </div>

        <div className="player-card-actions">
          <span className="time-display">{formattedTime}</span>
          <button
            onClick={onRemove}
            className="btn btn-small btn-secondary"
          >
            × Remove
          </button>
        </div>
      </div>
    </div>
  );
};
