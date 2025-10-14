# Implementation Plan: Insights Page

## Overview
Building an insights page with goal tracking, pattern recognition, and visual analytics. Features will be implemented incrementally, one at a time, with testing between each phase.

**Important**: All features must work in both Cloudflare and standalone modes. Test with `bun run build:standalone` after each phase.

---

## Phase 1: Navigation & Page Structure ✅ COMPLETED
**Goal**: Add Insights page to the app with basic navigation

### Tasks:
1. **Add navigation component**
   - Create `Navigation.tsx` component with Home/Insights tabs
   - Use shadcn/ui Tabs component for navigation
   - Mobile-first design with bottom tab bar (mobile) / top tabs (desktop)

2. **Create InsightsPage component**
   - New file: `src/pages/InsightsPage.tsx`
   - Basic page structure with heading and placeholder content
   - Responsive container with padding

3. **Update main.tsx routing**
   - Modify main.tsx to handle Home vs Insights page state
   - Use simple state-based navigation (no router needed)
   - Default to Home page

4. **Styling & layout**
   - Consistent with HomePage theme (orange gradients)
   - Mobile-responsive grid for insight tiles
   - Empty state message: "Add weight entries to see insights"

### Files to modify:
- `src/components/Navigation.tsx` (new)
- `src/pages/InsightsPage.tsx` (new)
- `src/main.tsx` (update)
- `src/pages/HomePage.tsx` (wrap with navigation)

### Testing criteria:
- [x] Navigation switches between Home and Insights pages
- [x] Active tab is visually indicated
- [x] Layout is responsive on mobile and desktop
- [x] Empty state shows when no data exists

**Completed**: 2025-10-14
**Files created/modified**:
- `src/components/Navigation.tsx` (new)
- `src/pages/InsightsPage.tsx` (new)
- `src/main.tsx` (updated)
- `src/pages/HomePage.tsx` (updated)

---

## Phase 2: Goal Settings UI & Storage ✅ COMPLETED
**Goal**: Allow users to set and persist goal weight/date

### Tasks:
1. **Extend Zustand store**
   - Add `GoalSettings` interface to `use-weight-store.ts`
   - Add actions: `setGoal()`, `clearGoal()`
   - Persist goals to localStorage alongside entries

2. **Create GoalSettingsCard component**
   - New file: `src/components/GoalSettingsCard.tsx`
   - Form with inputs: target weight, target date (optional)
   - Unit toggle (kg/lbs) matching main form
   - "Set Goal" and "Clear Goal" buttons
   - Show current goal if set

3. **Form validation**
   - Use React Hook Form + Zod
   - Validate: target weight > 0, target date >= today
   - Show validation errors inline

4. **Add to InsightsPage**
   - Place GoalSettingsCard at top of page
   - Conditional rendering: show form if no goal, show summary if goal set
   - Edit mode toggle for updating existing goal

### Files to modify:
- `src/hooks/use-weight-store.ts` (extend)
- `src/components/GoalSettingsCard.tsx` (new)
- `src/pages/InsightsPage.tsx` (add card)

### Testing criteria:
- [x] Can set goal weight and optional date
- [x] Goal persists after page refresh
- [x] Unit conversion works (kg/lbs)
- [x] Can clear and re-set goal
- [x] Validation prevents invalid inputs

**Completed**: 2025-10-14
**Files created/modified**:
- `src/hooks/use-weight-store.ts` (extended with GoalSettings)
- `src/components/GoalSettingsCard.tsx` (new)
- `src/pages/InsightsPage.tsx` (updated)

---

## Phase 3: Goal Progress Metrics ✅ COMPLETED
**Goal**: Display progress toward goal with forecasting

### Tasks:
1. **Create analytics utilities**
   - New file: `src/lib/analytics.ts`
   - Functions:
     - `calculateProgress(currentWeight, startWeight, targetWeight): number`
     - `calculateWeightTrend(entries, days): { slope, intercept }`
     - `forecastDate(entries, targetWeight): Date | null`
     - `calculateWeeklyRate(entries, weeks): number`

2. **Create GoalProgressCard component**
   - New file: `src/components/GoalProgressCard.tsx`
   - Circular progress indicator (shadcn/ui Progress component styled as circle)
   - Display:
     - Current weight vs. target weight
     - % progress
     - Weight remaining
     - Weekly rate: "Losing 0.3kg/week on average"

3. **Create ForecastCard component**
   - New file: `src/components/ForecastCard.tsx`
   - Linear regression forecast
   - Display: "At current pace, you'll reach [target] by [date]"
   - Show confidence indicator if data is sparse (<2 weeks)
   - Handle edge cases: no trend, weight moving away from goal

4. **Add to InsightsPage**
   - Show both cards only when goal is set AND sufficient data (14+ days)
   - Show helpful message if insufficient data

### Files to modify:
- `src/lib/analytics.ts` (new)
- `src/components/GoalProgressCard.tsx` (new)
- `src/components/ForecastCard.tsx` (new)
- `src/pages/InsightsPage.tsx` (add cards)

### Testing criteria:
- [x] Progress % calculates correctly
- [x] Weekly rate shows positive/negative change
- [x] Forecast date is reasonable given trend
- [x] Handles edge cases (no data, moving away from goal)
- [x] Shows "need more data" message when <14 days

**Completed**: 2025-10-14
**Files created/modified**:
- `src/lib/analytics.ts` (new - 10 utility functions)
- `src/components/GoalProgressCard.tsx` (new)
- `src/components/ForecastCard.tsx` (new)
- `src/components/MilestonesCard.tsx` (new)
- `src/pages/InsightsPage.tsx` (updated)

---

## Phase 4: Milestone Tracking
**Goal**: Show achievements and streaks

### Tasks:
1. **Add milestone utilities to analytics.ts**
   - `getTotalWeightChange(entries): number`
   - `getLowestWeightDate(entries, timeframe): { weight, date }`
   - `getCurrentStreak(entries): number`
   - `getLongestStreak(entries): number`

2. **Create MilestonesCard component**
   - New file: `src/components/MilestonesCard.tsx`
   - Display achievement badges:
     - "Lost 5kg total since starting!"
     - "Lowest weight in 6 months: 72kg on Jan 15"
     - "Current streak: 12 days"
     - "Longest streak: 45 days"
   - Icon badges for each milestone (lucide-react icons)
   - Animate on mount (framer-motion)

3. **Add to InsightsPage**
   - Place below goal progress section
   - Show even if no goal is set (works independently)

### Files to modify:
- `src/lib/analytics.ts` (extend)
- `src/components/MilestonesCard.tsx` (new)
- `src/pages/InsightsPage.tsx` (add card)

### Testing criteria:
- [ ] Total weight change calculates correctly
- [ ] Streak counts consecutive logging days
- [ ] "Lowest in X months" filters correctly
- [ ] Badges animate on load
- [ ] Works without goal set

---

## Phase 5: Pattern Recognition Analytics
**Goal**: Identify day-of-week and weekly patterns

### Tasks:
1. **Add pattern utilities to analytics.ts**
   - `getAverageByDayOfWeek(entries): Record<string, number>`
   - `getWeekdayVsWeekendAverage(entries): { weekday, weekend, diff }`
   - `getMonthlyAverages(entries): Array<{ month, avg }>`
   - `detectPlateau(entries, thresholdKg, minDays): Array<{ start, end, avgWeight }>`

2. **Create DayOfWeekCard component**
   - New file: `src/components/DayOfWeekCard.tsx`
   - Bar chart (Recharts) showing average weight for each day
   - Highlight highest/lowest days
   - Text insight: "You're typically 0.5kg heavier on Mondays"

3. **Create WeeklyCycleCard component**
   - New file: `src/components/WeeklyCycleCard.tsx`
   - Compare weekday vs. weekend averages
   - Visual indicator (bar comparison or card layout)
   - Text insight: "Your weight increases by 0.3kg on weekends"

4. **Create PlateauCard component**
   - New file: `src/components/PlateauCard.tsx`
   - List recent plateaus (last 3)
   - Display: "[14 days] at ~75kg from Jan 1 - Jan 14"
   - Show current plateau if detected

5. **Add to InsightsPage**
   - Place in "Patterns" section
   - Require 14+ days of data
   - Show progressive messages if insufficient data

### Files to modify:
- `src/lib/analytics.ts` (extend)
- `src/components/DayOfWeekCard.tsx` (new)
- `src/components/WeeklyCycleCard.tsx` (new)
- `src/components/PlateauCard.tsx` (new)
- `src/pages/InsightsPage.tsx` (add cards)

### Testing criteria:
- [ ] Day-of-week averages calculate correctly
- [ ] Weekend vs. weekday comparison is accurate
- [ ] Plateau detection identifies stable periods
- [ ] Charts render responsively
- [ ] Handles sparse data gracefully

---

## Phase 6: Visual Comparisons
**Goal**: Add distribution histogram and heatmap

### Tasks:
1. **Add visualization utilities to analytics.ts**
   - `getWeightDistribution(entries, bucketSize): Array<{ range, count }>`
   - `getDayOfWeekHeatmap(entries): Array<Array<{ date, weight, dayOfWeek }>>`

2. **Create DistributionCard component**
   - New file: `src/components/DistributionCard.tsx`
   - Histogram chart (Recharts BarChart)
   - X-axis: Weight ranges (e.g., "74-75kg")
   - Y-axis: Number of days at that weight
   - Show median and most common range

3. **Create HeatmapCard component**
   - New file: `src/components/HeatmapCard.tsx`
   - Grid layout: rows = weeks, columns = Mon-Sun
   - Color intensity based on weight (darker = heavier)
   - Tooltip on hover showing date and weight
   - Use Recharts or custom SVG grid

4. **Add to InsightsPage**
   - Place in "Visual Analysis" section
   - Require 14+ days of data for meaningful viz

### Files to modify:
- `src/lib/analytics.ts` (extend)
- `src/components/DistributionCard.tsx` (new)
- `src/components/HeatmapCard.tsx` (new)
- `src/pages/InsightsPage.tsx` (add cards)

### Testing criteria:
- [ ] Histogram shows weight distribution correctly
- [ ] Heatmap colors reflect weight values
- [ ] Tooltips display date and weight
- [ ] Visualizations are mobile-responsive
- [ ] Empty states for insufficient data

---

## Phase 7: Polish & Optimization
**Goal**: Refine UI/UX and performance

### Tasks:
1. **Loading states**
   - Add skeleton loaders for cards while calculating
   - Debounce calculations on data changes

2. **Empty states**
   - Improve messaging for each card when insufficient data
   - Add illustrations or icons

3. **Accessibility**
   - ARIA labels for charts and interactive elements
   - Keyboard navigation for tabs
   - Screen reader support for insights

4. **Performance**
   - Memoize expensive calculations (useMemo)
   - Lazy load charts (React.lazy for Recharts)

5. **Mobile optimization**
   - Test on various screen sizes
   - Optimize touch targets
   - Swipeable cards on mobile

6. **Dark mode**
   - Ensure all cards respect theme toggle
   - Adjust chart colors for dark mode

### Files to modify:
- All card components (add loading/empty states)
- `src/pages/InsightsPage.tsx` (memoization)
- CSS/Tailwind adjustments

### Testing criteria:
- [ ] Smooth performance with 100+ entries
- [ ] Loading states appear during calculations
- [ ] All elements accessible via keyboard
- [ ] Dark mode displays correctly
- [ ] Mobile experience is fluid

---

## Implementation Order Summary

1. **Phase 1**: Navigation & page structure ➜ *Basic scaffolding*
2. **Phase 2**: Goal settings UI & storage ➜ *User can set goals*
3. **Phase 3**: Goal progress metrics ➜ *Progress tracking*
4. **Phase 4**: Milestone tracking ➜ *Achievements*
5. **Phase 5**: Pattern recognition ➜ *Behavioral insights*
6. **Phase 6**: Visual comparisons ➜ *Advanced charts*
7. **Phase 7**: Polish & optimization ➜ *Production-ready*

Each phase builds on the previous and delivers working functionality. User feedback can be incorporated between phases.
