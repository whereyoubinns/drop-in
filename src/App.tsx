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
  const [sessionDuration, setSessionDuration] = useState(20); // in minutes
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Apply dark mode class and persist preference
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const {
    state,
    addPlayer,
    removeFromQueue,
    addToCourt,
    addSpecificPlayerToCourt,
    removeFromCourt,
    clearCourt,
    clearQueue,
    reorderQueue,
    clearAll,
  } = useCourtManager();

  return (
    <div className="app">
      <header className="app-header">
        <h1>Drop-In Court Manager</h1>
        <div className="header-info">
          <div className="session-config">
            <span>Friday Night Drop-In • </span>
            <select
              value={sessionDuration}
              onChange={(e) => setSessionDuration(Number(e.target.value))}
              className="session-duration-select"
            >
              <option value={20}>20min</option>
              <option value={25}>25min</option>
              <option value={30}>30min</option>
              <option value={35}>35min</option>
            </select>
            <span> Sessions</span>
          </div>
          <div className="header-right">
            <span className="current-time">{formatClockTime(currentTime)}</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="btn btn-secondary btn-icon-only"
              aria-label="Toggle dark mode"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
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
                    Clear All
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
            onAddPlayerToCourt={addSpecificPlayerToCourt}
            onReorderQueue={reorderQueue}
            sessionDuration={sessionDuration}
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
              sessionDuration={sessionDuration}
            />

            <CourtPanel
              courtId="court1"
              players={state.court1}
              queueLength={state.waitingQueue.length}
              onAddFromQueue={() => addToCourt('court1')}
              onAddPlayerToCourt={(playerId) => addSpecificPlayerToCourt('court1', playerId)}
              onRemovePlayer={(playerId) => removeFromCourt('court1', playerId)}
              onClear={() => clearCourt('court1')}
              sessionDuration={sessionDuration}
            />
          </div>
        </main>
      </div>

      <footer className="app-footer">
        <div className="legend">
          <span className="legend-item">
            <span className="legend-color good"></span> &lt; {Math.floor(sessionDuration * 0.75)} min
          </span>
          <span className="legend-item">
            <span className="legend-color warning"></span> {Math.floor(sessionDuration * 0.75)}-{sessionDuration} min
          </span>
          <span className="legend-item">
            <span className="legend-color overtime"></span> &gt; {sessionDuration} min (Overtime)
          </span>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
