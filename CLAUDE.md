# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Momentum: Privacy-First Weight Tracker

## Overview
A client-side React application for tracking weight over time with complete privacy. All data is stored locally in browser localStorage—no backend, no cloud sync, no data collection.

**Planned features**: See [near-term-features.md](./near-term-features.md) for upcoming feature development.

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

## Development Commands

### Setup
```bash
bun install                    # Install dependencies
```

### Development
```bash
bun run dev                    # Start dev server (localhost:3000)
bun run lint                   # Run ESLint linter
```

### Building
```bash
bun run build                  # Build for Cloudflare deployment (dist/client/)
bun run build:standalone       # Build single-file HTML (dist-standalone/)
bun run preview                # Build and preview production build
```

### Deployment
```bash
bun run deploy                 # Deploy to Cloudflare (builds + wrangler deploy)
bun run cf-typegen             # Generate Cloudflare Workers TypeScript types
```

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

## Important Implementation Notes

### Build Mode Detection
The build system uses `VITE_BUILD_STANDALONE` environment variable to toggle between two build modes:
- **Standalone**: `VITE_BUILD_STANDALONE=true` creates a single-file HTML app
- **Cloudflare**: Default mode (no env var) builds for Cloudflare Workers deployment

This affects:
- Plugin loading (vite.config.ts:97-99)
- Base URL configuration (vite.config.ts:101)
- Output directory (vite.config.ts:113)
- Asset inlining behavior (vite.config.ts:106)

### Path Resolution
Use `@/` alias for all src imports:
```typescript
import { useWeightStore } from '@/hooks/use-weight-store';
import { Button } from '@/components/ui/button';
```
Configured in vite.config.ts:123-126

### Weight Storage Convention
All weight values are **stored in kilograms** internally (use-weight-store.ts:10). Unit conversion happens at input/display boundaries:
- Input: User can enter kg or lbs (converted via LBS_TO_KG_CONVERSION_FACTOR)
- Storage: Always kg in Zustand store → localStorage
- Display: Can show kg or lbs based on user preference

### Date Format Standard
Dates are always stored as `YYYY-MM-DD` strings (use-weight-store.ts:9):
- Use `date-fns` for all date operations (format, parse, isValid)
- One entry per date (duplicates update existing entry)
- Sort entries by date ascending (use-weight-store.ts:46)

### Rendering & Routing
The app renders `HomePage` directly in main.tsx (no React Router):
- Standalone mode: HomePage rendered without router
- Single-page application with no navigation
- All UI components are in the HomePage component tree
