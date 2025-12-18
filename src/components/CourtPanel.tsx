import { useState, useEffect } from 'react';
import type { Player, CourtId } from '../types';
import { PlayerCard } from './PlayerCard';
import { getTimeOnCourt, getTimeStatus } from '../utils/timeUtils';
import { useToast } from '../hooks/useToast';

interface CourtPanelProps {
  courtId: CourtId;
  players: Player[];
  queueLength: number;
  onAddFromQueue: () => void;
  onRemovePlayer: (playerId: string) => void;
  onAddPlayerToCourt: (playerId: string) => void;
  onClear: () => void;
  sessionDuration: number; // in minutes
}

export const CourtPanel = ({
  courtId,
  players,
  queueLength,
  onAddFromQueue,
  onRemovePlayer,
  onAddPlayerToCourt,
  onClear,
  sessionDuration,
}: CourtPanelProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [, setTick] = useState(0);
  const { showToast } = useToast();

  const courtName = courtId === 'court1' ? 'Court 1 (right)' : 'Court 2 (left)';
  const isFull = players.length >= 3;

  // Update every second for live time tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Find player who has been on court the longest (next to come off)
  const nextOffPlayer = players.length > 0
    ? [...players].sort((a, b) => (a.onCourtAt || 0) - (b.onCourtAt || 0))[0]
    : null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isFull) {
      e.dataTransfer.dropEffect = 'move';
      setIsDragOver(true);
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isFull) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only set isDragOver to false if we're actually leaving the court panel
    // and not just hovering over a child element
    const relatedTarget = e.relatedTarget as Node;
    if (!e.currentTarget.contains(relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (isFull) {
      showToast('Court is full! Maximum 3 players per court.', 'warning');
      return;
    }

    const playerId = e.dataTransfer.getData('playerId');
    const sourceCourt = e.dataTransfer.getData('sourceCourt');

    if (playerId) {
      // If source is the same court, do nothing
      if (sourceCourt === courtId) {
        return;
      }

      onAddPlayerToCourt(playerId);
    }
  };

  return (
    <div
      className={`court-panel panel ${isDragOver && !isFull ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="court-header">
        <h2>{courtName}</h2>
        <div className="court-header-right">
          <div className="court-capacity">
            {[...Array(3)].map((_, index) => {
              const player = players[index];
              let statusClass = 'empty';

              if (player) {
                const timeOnCourt = getTimeOnCourt(player.onCourtAt);
                const timeStatus = getTimeStatus(timeOnCourt, sessionDuration);
                statusClass = `filled ${timeStatus}`;
              }

              return (
                <span
                  key={index}
                  className={`capacity-dot ${statusClass}`}
                />
              );
            })}
          </div>
          <div className="court-menu">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="btn btn-secondary btn-icon-only"
              aria-label="Court options"
            >
              ⋯
            </button>
            {menuOpen && (
              <>
                <div
                  className="menu-overlay"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="menu-dropdown">
                  <button
                    onClick={() => {
                      onClear();
                      setMenuOpen(false);
                    }}
                    disabled={players.length === 0}
                    className="menu-item menu-item-danger"
                  >
                    Clear Court
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="court-players">
        {players.map(player => (
          <PlayerCard
            key={player.id}
            player={player}
            isNextOff={nextOffPlayer?.id === player.id}
            onRemove={() => onRemovePlayer(player.id)}
            courtId={courtId}
            sessionDuration={sessionDuration}
          />
        ))}
        {[...Array(3 - players.length)].map((_, index) => (
          <div key={`empty-${index}`} className="empty-slot">
            <button
              onClick={onAddFromQueue}
              disabled={queueLength === 0}
              className="btn btn-primary btn-small"
            >
              Add from Queue
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
