# Squamish Squash Drop-In Court Manager

A lightweight web application for managing Friday night squash drop-in sessions with 2 courts, FIFO rotation, and configurable play slots (20-35 minutes).
Hosted at: https://whereyoubinns.github.io/drop-in/

## Features

### Queue Management
- **Add Players**: Simple form to add players to the waiting queue
- **FIFO Ordering**: First-in, first-out rotation system
- **Drag & Drop Reordering**: Reorder players in the queue by dragging and dropping
  - Visual drop zones show where players will be inserted
  - Green border animation confirms successful reordering
  - Smart logic prevents unnecessary reorders
- **Estimated Time On**: Each queued player sees when they'll likely go on court
- **Next Court Indicator**: Shows which court the next player will go to (clickable to add)
- **Replacing Player**: Shows who will be replaced when courts are full
- **Going On Soon**: Visual outline for players going on within 5 minutes

### Court Management
- **Two Courts**: Manage up to 3 players per court simultaneously
- **Drag & Drop**: Move players from queue to courts or between courts
- **Visual Capacity**: Colored dots show court capacity and player status
  - Filled dots for occupied spots
  - Empty dots for available spots
  - Color-coded by player time on court
- **Empty Slot Pills**: Visual placeholders with "Add from Queue" buttons
- **Court Menu**: Kebab menu (⋯) for clearing courts
- **Time Tracking**: Live countdown showing time on court for each player
- **Estimated Time Off**: Shows when each player should rotate off

### Visual Indicators
- **Player Status Colors**:
  - 🟢 Green: < 75% of session time
  - 🟡 Yellow: 75%-100% of session time
  - 🔴 Red: > 100% (overtime)
- **Badges**:
  - ⏳ Next Off: Player who's been on longest
  - 🔴 Overtime: Player over time limit
  - Next: First player in queue
- **Live Clock**: Current time displayed in header

### Customization
- **Configurable Session Duration**: Choose between 20, 25, 30, or 35-minute sessions
  - All time calculations update dynamically
  - Legend adjusts to show correct thresholds
- **Dark Mode**: Toggle between light and dark themes
  - Persistent preference saved to localStorage
  - Optimized contrast for all UI elements

### Smart Features
- **Toast Notifications**: Non-blocking notifications for actions
- **Automatic Midnight Reset**: Clears all data at midnight daily
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

1. Enter a player's name in the "Queue" panel
2. Click "Add" or press Enter
3. Players are added to the queue in FIFO order

### Reordering the Queue

1. **Drag any player** in the queue to reorder
2. Drop zones appear between players showing where they'll be inserted
3. Green border animation confirms successful reorder
4. Dropping on the same position does nothing

### Moving Players to Courts

**Option 1: Drag & Drop**
1. Drag a player from the queue
2. Drop onto a court panel (max 3 players per court)
3. Toast notification confirms if court is full

**Option 2: Quick Add Buttons**
1. Click "Add from Queue" on empty slot pills
2. Click the "→ Court X" badge on the first queued player

**Option 3: Between Courts**
1. Drag a player from one court to another
2. Only works if target court has space

### Managing Courts

Each court provides:

- **Visual Capacity Dots**: Shows 3 dots (filled/empty) reflecting player status
- **Player Cards**: Show name, time on court, estimated time off, and status
- **Remove Button**: Remove individual players (returns them to queue)
- **Court Menu (⋯)**: Access "Clear Court" option
- **Empty Slot Pills**: Visual indicators with "Add from Queue" buttons

### Time Tracking

- Time starts automatically when a player is added to a court
- Updates every second
- Color-coded indicators show time status:
  - Green: Under session threshold (e.g., < 15 min for 20-min sessions)
  - Yellow: Between threshold and session time (e.g., 15-20 min)
  - Red: Overtime (over session duration)
- **Next Off** badge shows who has been on court the longest
- **Overtime** badge shows players over time limit
- **Estimated Time Off** shows when each player should rotate off

### Queue Intelligence

- **Estimated Time On**: Shows when each queued player will likely go on court
  - Shows "Now" if they can go on immediately or time is past
- **Next Court**: Indicates which court (left/right) the player will go to
  - Based on FIFO logic and available spots
- **Replacing**: Shows which player will be replaced (when courts are full)
- **Going On Soon**: Visual outline for players going on within 5 minutes

### Global Controls

**Header Menu (⋯)**
- Clear Queue: Remove all players from queue
- Clear All: Reset entire application

**Settings**
- Session Duration: Choose 20, 25, 30, or 35-minute sessions
- Dark Mode: Toggle between light and dark themes
- Current Time: Live clock display

### Best Practices

1. **Start of Session**: Add all arriving players to the queue
2. **Fill Courts**: Use drag & drop or "Add from Queue" buttons
3. **Monitor Time**: Watch for yellow/red indicators and "Next Off" badges
4. **Regular Rotation**: Remove overtime players and let queue fill in
5. **Reorder Queue**: Adjust priority by dragging players up/down
6. **Late Arrivals**: Simply add new players - they'll join the queue automatically

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
│   ├── AddPlayerForm.tsx    # Player name input form
│   ├── CourtPanel.tsx       # Individual court display with drag & drop
│   ├── PlayerCard.tsx       # Player info on court
│   ├── QueuePanel.tsx       # Waiting queue with reordering
│   └── Toast.tsx            # Toast notification component
├── hooks/              # Custom React hooks
│   ├── useCourtManager.ts   # State management and game logic
│   └── useToast.tsx         # Toast notification system
├── utils/              # Utility functions
│   └── timeUtils.ts         # Time formatting and calculations
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main application component
├── App.css             # Application styles (with dark mode)
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
3. **Configurable sessions**: Choose 20, 25, 30, or 35-minute sessions
4. **Automatic time tracking**: Starts when player goes on court
5. **No duplicate names**: Prevents adding players with existing names
6. **Smart reordering**: Prevents unnecessary position changes in queue
7. **Midnight reset**: All data clears automatically at midnight

## User Interactions

### Drag & Drop
- **Queue Reordering**: Drag any player to reorder the queue
  - Drop zones appear between items
  - Green border confirms successful reorder
  - Adjacent drops are ignored
- **Queue to Court**: Drag players from queue onto court panels
  - Court highlights when hovering (if space available)
  - Toast warning if court is full
- **Between Courts**: Drag players between courts if space available

### Keyboard Shortcuts

- **Enter**: Submit player name in the add player form

### Click Actions
- **Add from Queue**: Buttons on empty court slots
- **→ Court X**: Quick add from first queued player
- **× Remove**: Remove individual players
- **⋯ Menu**: Access clear and reset options
- **🌙/☀️**: Toggle dark mode

## Browser Support

Works in all modern browsers that support:
- ES2022
- LocalStorage
- CSS Grid and Flexbox
- HTML5 Drag and Drop API
- CSS Custom Properties (for dark mode)
- CSS animations and transitions

Tested on: Chrome, Firefox, Safari, Edge (latest versions)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Deployment

The application builds to static files in the `dist/` directory and can be deployed to any static hosting service:

**Recommended platforms:**
- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

**Build output:**
- `dist/index.html` - Main HTML file
- `dist/assets/` - Bundled JS and CSS files

Simply run `npm run build` and deploy the `dist/` directory.

### Code Quality

The project uses:
- TypeScript for type safety with strict configuration
- Type-only imports for better module optimization
- ESLint for code linting
- Modern React patterns (hooks, functional components)
- Custom hooks for reusable logic
- CSS custom properties for theming
- Responsive design principles

### Design & UX

The application features:
- **Modern, Clean Interface**: Purple gradient header, card-based layout
- **Visual Feedback**:
  - Drag & drop hover states
  - Green border animation for successful reorders
  - Toast notifications for actions
  - Color-coded time indicators
- **Accessibility**:
  - ARIA labels on interactive elements
  - Keyboard navigation support
  - High contrast in dark mode
- **Responsive Layout**:
  - 1/3 page width for queue
  - 1/3 page width each for courts
  - Sticky footer with legend
  - Scrollable queue with custom scrollbar

## Implemented Features ✅

- ✅ Customizable session duration (20, 25, 30, 35 minutes)
- ✅ Dark mode toggle with persistent preference
- ✅ Drag & drop for queue reordering
- ✅ Drag & drop to move players to/between courts
- ✅ Toast notification system
- ✅ Automatic midnight reset
- ✅ Visual capacity indicators
- ✅ Estimated time on/off calculations
- ✅ Going on soon indicators

## Future Enhancements (Optional)

- [ ] Export session statistics
- [ ] Player history tracking
- [ ] Sound notifications for overtime
- [ ] PWA support for offline use
- [ ] Print-friendly court schedule
- [ ] Multi-day session tracking
- [ ] Player performance analytics

## License

MIT

## Author

Built for Friday night squash drop-in sessions. Enjoy your games! 🎾
