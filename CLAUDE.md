# Momentum: Privacy-First Weight Tracker

## Overview
A client-side React application for tracking weight over time with complete privacy. All data is stored locally in browser localStorage—no backend, no cloud sync, no data collection.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui components + Framer Motion
- **State**: Zustand with localStorage persistence
- **Charts**: Recharts for weight visualization
- **Forms**: React Hook Form + Zod validation
- **Deployment**: Cloudflare Pages/Workers

## Architecture

### Core Components
- `WeightForm` - Input form with kg/lbs unit toggle
- `WeightChart` - Bar chart with color-coded bars, control lines, and 30-day scrollable timeline
- `WeightHistory` - List of all entries with delete and CSV export capability
- `WeightImportDialog` - CSV import functionality

### State Management
- **Store**: `use-weight-store.ts` (Zustand)
  - Stores entries as `{ id, date, weight }` (weight always in kg)
  - Persists to localStorage as `momentum-weight-storage`
  - Supports add, remove, and bulk CSV import
  - Automatically updates existing entries for same date

### Key Features
- **Privacy**: 100% client-side, zero server interaction
- **Unit Conversion**: Input in kg or lbs, stored as kg
- **Encouragement**: Random motivational messages on entry
- **Visual Analytics**:
  - Color-coded bars (green for weight loss, orange for gain/maintenance)
  - Statistical control lines (average ± 1 standard deviation)
  - Timeline gaps for missing dates
  - 30-day scrollable view with Brush component
- **Date Handling**: One entry per day (updates if duplicate)
- **Data Portability**: CSV import/export in `YYYY-MM-DD,weight` format
- **Theming**: Dark/light mode with orange-themed color palette

### Project Structure
```
src/
├── components/     # UI components (form, chart, history, etc.)
├── hooks/          # Custom hooks (weight store, theme, mobile)
├── lib/            # Utils, constants, error reporting
└── pages/          # HomePage (main view)

worker/             # Cloudflare Workers setup (minimal/static serving)
```

## Data Flow
1. User enters weight → Form validates with Zod
2. Store converts to kg → Persists to localStorage
3. Chart/History components auto-update via Zustand subscriptions
4. All data stays in browser—never leaves device

## Deployment

### Standalone Mode
Build single-file HTML with `bun run build:standalone`:
- Generates `dist-standalone/index.html` (~1MB)
- All CSS/JS inlined via vite-plugin-singlefile
- Can be opened directly in browser (file://)
- No server required
- Logo and assets included in same directory

#### Standalone Implementation Decisions:
1. **Single-File Architecture**:
   - Used `vite-plugin-singlefile` to inline all JavaScript and CSS
   - `VITE_BUILD_STANDALONE` env var toggles standalone vs. Cloudflare build
   - Output directory: `dist-standalone/` (vs. `dist/client/`)

2. **Asset Handling**:
   - Favicon: Base64-encoded and embedded in HTML `<link>` tags
   - Logo: Relative path (`logo.png`) copied to dist-standalone for file:// compatibility
   - All paths use relative URLs (`./ ` base) instead of absolute (`/`)

3. **Build Configuration** (vite.config.ts):
   ```typescript
   base: isStandalone ? './' : '/',
   cssCodeSplit: false,               // Bundle all CSS together
   assetsInlineLimit: 100000000,      // Inline all assets
   inlineDynamicImports: true,        // No code splitting
   ```

4. **Removed Dependencies**:
   - React Router (renders HomePage directly)
   - Cloudflare plugins (conditionally excluded)
   - Server error reporting endpoints

5. **Browser Compatibility**:
   - Works in all modern browsers via file:// protocol
   - localStorage persists data per file path
   - Favicon display limited by browser security (Chrome/Safari don't show favicons for local files)

#### Data Storage (Standalone):
- **Location**: Browser's localStorage for the specific file path
  - Firefox: `~/Library/Application Support/Firefox/Profiles/<profile>/storage/default/file+++<path>/`
  - Chrome: Similar profile-based storage
- **Key**: `momentum-weight-storage` (Zustand persist key)
- **Important**: Data is tied to file location—moving the HTML file creates a new storage context
- **Backup**: Use Export button to create CSV backups

### Cloudflare Mode
Standard build for Cloudflare deployment via Wrangler. Worker serves static assets; app runs entirely client-side.

## Recent Updates (This Session)

### Chart Enhancements
- **Y-axis fix**: Increased width (40px → 60px) and adjusted margins to show full weight labels
- **Color-coded bars**: Green for weight loss, orange for gain/maintenance
- **Statistical control lines**: Red dashed lines at average ± 1σ with labeled values
- **Gap visualization**: Missing dates show as gaps in timeline
- **Scrollable timeline**: Default 30-day view with Brush component for navigation
- **Extended timeline**: Shows data from first entry to today

### UI/UX Improvements
- **CSV Export**: Download weight data in `YYYY-MM-DD,weight` format
- **Logo integration**: Heart-chip logo displayed in header
- **Orange theme**: Gradient backgrounds and orange accents matching brand colors
- **Relative paths**: All assets use relative URLs for standalone compatibility

### Code Quality
- Removed React Router (unnecessary for single-page app)
- Conditional plugin loading based on build mode
- Proper date handling with `eachDayOfInterval` for gap detection
