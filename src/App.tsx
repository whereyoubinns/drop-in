import { useState, useEffect } from 'react';
import { ToastProvider } from './hooks/useToast';
import { useCourtManager } from './hooks/useCourtManager';
import { QueuePanel } from './components/QueuePanel';
import { CourtPanel } from './components/CourtPanel';
import { formatClockTime } from './utils/timeUtils';
import './App.css';

function AppContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const {
    state,
    addPlayer,
    removeFromQueue,
    addToCourt,
    addSpecificPlayerToCourt,
    removeFromCourt,
    clearCourt,
    clearQueue,
    clearAll,
  } = useCourtManager();

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎾 Squash Drop-In Court Manager</h1>
        <div className="header-info">
          <span>Friday Night Drop-In • 20min Sessions</span>
          <div className="header-right">
            <span className="current-time">{formatClockTime(currentTime)}</span>
            <div className="header-menu">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="btn btn-secondary btn-icon-only"
                aria-label="App options"
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
                      clearQueue();
                      setMenuOpen(false);
                    }}
                    disabled={state.waitingQueue.length === 0}
                    className="menu-item menu-item-danger"
                  >
                    Clear Queue
                  </button>
                  <button
                    onClick={() => {
                      clearAll();
                      setMenuOpen(false);
                    }}
                    className="menu-item menu-item-danger"
                  >
                    Clear All Courts
                  </button>
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      </header>

      <div className="app-layout">
        <aside className="sidebar">
          <QueuePanel
            queue={state.waitingQueue}
            court1Players={state.court1}
            court2Players={state.court2}
            onAddPlayer={addPlayer}
            onRemovePlayer={removeFromQueue}
          />
        </aside>

        <main className="main-content">
          <div className="courts-container">
            <CourtPanel
              courtId="court2"
              players={state.court2}
              queueLength={state.waitingQueue.length}
              onAddFromQueue={() => addToCourt('court2')}
              onAddPlayerToCourt={(playerId) => addSpecificPlayerToCourt('court2', playerId)}
              onRemovePlayer={(playerId) => removeFromCourt('court2', playerId)}
              onClear={() => clearCourt('court2')}
            />

            <CourtPanel
              courtId="court1"
              players={state.court1}
              queueLength={state.waitingQueue.length}
              onAddFromQueue={() => addToCourt('court1')}
              onAddPlayerToCourt={(playerId) => addSpecificPlayerToCourt('court1', playerId)}
              onRemovePlayer={(playerId) => removeFromCourt('court1', playerId)}
              onClear={() => clearCourt('court1')}
            />
          </div>
        </main>
      </div>

      <footer className="app-footer">
        <div className="legend">
          <span className="legend-item">
            <span className="legend-color good"></span> &lt; 15 min
          </span>
          <span className="legend-item">
            <span className="legend-color warning"></span> 15-20 min
          </span>
          <span className="legend-item">
            <span className="legend-color overtime"></span> &gt; 20 min (Overtime)
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
