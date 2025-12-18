# 🎾 Squash Drop-In Court Manager

A lightweight web application for managing Friday night squash drop-in sessions with 2 courts, FIFO rotation, and 20-minute play slots.

## Features

- **Queue Management**: Add players to a waiting queue with FIFO ordering
- **Two Courts**: Manage up to 3 players per court simultaneously
- **Time Tracking**: Automatic timer showing how long each player has been on court
- **Visual Indicators**:
  - 🟢 Green: < 15 minutes
  - 🟡 Yellow: 15-20 minutes
  - 🔴 Red: > 20 minutes (overtime)
  - ⏳ Badge showing who's next to come off
- **Smart Rotation**: One-click rotation removes the longest-playing player and adds from queue
- **LocalStorage Persistence**: State survives page refreshes
- **No Database Required**: All state managed in-memory and browser storage

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+ (recommended)
- npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

### Adding Players

1. Enter a player's name in the "Waiting Queue" panel
2. Click "Add Player" or press Enter
3. Players are added to the queue in FIFO order

### Managing Courts

Each court has the following actions:

- **Add from Queue**: Move the next player from queue to the court
- **🔄 Rotate**: Remove the player who's been on longest and add next from queue
- **Remove Next**: Remove the player who's been on longest (sends back to queue)
- **Clear Court**: Remove all players from the court (sends all back to queue)

### Time Tracking

- Time starts automatically when a player is added to a court
- Updates every second
- Color-coded indicators show time status:
  - Green background: Under 15 minutes
  - Yellow background: 15-20 minutes
  - Red background with pulse animation: Over 20 minutes (overtime)
- "Next Off" badge shows who has been on court the longest

### Best Practices

1. **Start of Session**: Add all arriving players to the queue
2. **Fill Courts**: Use "Add from Queue" to fill both courts
3. **Regular Rotation**: Use the "🔄 Rotate" button when players reach 20 minutes
4. **Late Arrivals**: Simply add new players - they'll join the queue automatically

## Technical Details

### Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Custom CSS with modern design
- **State Management**: React Hooks with localStorage persistence
- **No Backend**: Fully client-side application

### Project Structure

```
src/
├── components/          # React components
│   ├── AddPlayerForm.tsx
│   ├── CourtPanel.tsx
│   ├── PlayerCard.tsx
│   └── QueuePanel.tsx
├── hooks/              # Custom React hooks
│   └── useCourtManager.ts
├── utils/              # Utility functions
│   └── timeUtils.ts
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main application component
├── App.css             # Application styles
└── main.tsx            # Application entry point
```

### Data Model

```typescript
interface Player {
  id: string;
  name: string;
  joinedAt: number;      // Timestamp when added to queue
  onCourtAt?: number;    // Timestamp when placed on court
  court?: "court1" | "court2";
}

interface AppState {
  court1: Player[];
  court2: Player[];
  waitingQueue: Player[];
}
```

## Core Rules

1. **Maximum 3 players per court**
2. **FIFO rotation**: Player who's been on court longest comes off first
3. **20-minute sessions**: Visual indicators show when time is up
4. **Automatic time tracking**: Starts when player goes on court
5. **No duplicate names**: Prevents adding players with existing names

## Keyboard Shortcuts

- **Enter**: Submit player name in the add player form

## Browser Support

Works in all modern browsers that support:
- ES2022
- LocalStorage
- CSS Grid and Flexbox

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Quality

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Strict TypeScript configuration
- Modern React patterns (hooks, functional components)

## Future Enhancements (Optional)

- [ ] Export session statistics
- [ ] Player history tracking
- [ ] Customizable session duration
- [ ] Sound notifications for overtime
- [ ] Dark mode toggle
- [ ] PWA support for offline use
- [ ] Print-friendly court schedule

## License

MIT

## Author

Built for Friday night squash drop-in sessions. Enjoy your games! 🎾
