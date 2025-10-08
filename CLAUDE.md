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
- `WeightChart` - Bar chart with dynamic Y-axis scaling
- `WeightHistory` - List of all entries with delete capability
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
- **Smart Charting**: Auto-scaled Y-axis for optimal data visualization
- **Date Handling**: One entry per day (updates if duplicate)
- **CSV Import**: Bulk data import in `YYYY-MM-DD,weight` format

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
- Generates `dist-standalone/index.html` (~967KB)
- All CSS/JS inlined via vite-plugin-singlefile
- Can be opened directly in browser (file://)
- No server required

### Cloudflare Mode
Standard build for Cloudflare deployment via Wrangler. Worker serves static assets; app runs entirely client-side.
