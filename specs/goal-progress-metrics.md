# Feature Spec: Goal Progress Metrics

**Version**: 1.0
**Status**: Implemented
**Date**: 2025-10-14

## Overview

The Goal Progress Metrics feature provides users with comprehensive analytics and insights about their weight loss journey. It tracks progress toward goals, forecasts completion dates using linear regression, and displays motivational milestones to encourage continued engagement.

## Motivation

Users need more than just raw weight data to stay motivated. This feature provides:
- **Visibility**: Clear metrics showing how close they are to their goal
- **Prediction**: Data-driven forecasts to set realistic expectations
- **Motivation**: Achievement badges and streaks to encourage daily logging
- **Insight**: Understanding of weekly trends and patterns

## User Stories

1. **As a user**, I want to see my progress percentage toward my goal so I know how far I've come
2. **As a user**, I want to know my weekly rate of change so I can understand if my approach is working
3. **As a user**, I want to see when I'll reach my goal based on current trends so I can plan accordingly
4. **As a user**, I want to track my logging streak so I stay motivated to log daily
5. **As a user**, I want to see my achievements (lowest weight, total change) so I feel encouraged

## Features

### 1. Goal Progress Card

**Purpose**: Display current progress toward the user's goal weight.

**Components**:
- Progress bar (0-100%) with percentage display
- Current weight vs. target weight comparison
- Weight remaining to reach goal
- Weekly rate of change with trend indicator

**Calculations**:
```typescript
progress = ((currentWeight - startWeight) / (targetWeight - startWeight)) * 100
weeklyRate = (weightChange / days) * 7  // Last 14 days
```

**Visual Design**:
- Green theme (positive progress)
- Trend icons: ↓ (losing), ↑ (gaining), — (stable)
- Color-coded weekly rate:
  - Green: Losing weight (< -0.1 kg/week)
  - Orange: Gaining weight (> 0.1 kg/week)
  - Gray: Stable (±0.1 kg/week)

**Edge Cases**:
- No goal set → Card not displayed
- No entries → Card not displayed
- Start weight unavailable → Progress shows 0%

### 2. Forecast Card

**Purpose**: Predict when the user will reach their goal based on current trends.

**Algorithm**: Linear regression on last 14 days of data
```typescript
// Convert dates to days since first entry
// Calculate slope (kg/day) and intercept
slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
intercept = (sumY - slope * sumX) / n

// Forecast completion
daysNeeded = (targetWeight - currentWeight) / slope
forecastDate = currentDate + daysNeeded
```

**Display**:
- Forecasted completion date in readable format (e.g., "December 15, 2025")
- Comparison with user's target date (if set)
- Confidence note about forecast accuracy

**Progressive Enhancement**:
- **< 14 days of data**: Shows message "Log for 14 days to see forecast"
- **No significant trend** (slope ≈ 0): Shows "No trend detected"
- **Moving away from goal** (negative daysNeeded): Shows "Weight moving away from goal"
- **Too far in future** (> 730 days): Shows "Cannot forecast reliably"

**Visual Design**:
- Blue theme (analytical/informational)
- Warning icons for insufficient data
- Amber alerts for issues

### 3. Milestones Card

**Purpose**: Display achievements and encourage continued engagement.

**Metrics**:

1. **Total Weight Change**
   - Shows: Total kg lost/gained since first entry
   - Icon: ↓ (green) if losing, ↑ (orange) if gaining
   - Formula: `lastWeight - firstWeight`

2. **Lowest Weight in 6 Months**
   - Shows: Lowest weight achieved in last 6 months
   - Date of achievement
   - Icon: Award (purple)

3. **Current Streak**
   - Shows: Consecutive days of logging
   - Must log within 1 day to maintain streak
   - Icon: Flame (red)
   - Encouragement: "Keep it going!" or "Log today to start"

4. **Longest Streak**
   - Shows: Best streak ever achieved
   - Icon: Calendar (blue)
   - Special note if current streak = longest: "New record!"

**Visual Design**:
- 2x2 grid on desktop, stacked on mobile
- Color-coded icons for each metric
- Hover effect on cards
- Truncated text with tooltips if needed

## Technical Architecture

### Analytics Module (`src/lib/analytics.ts`)

**Core Functions**:

```typescript
// Progress calculation
calculateProgress(current: number, start: number, target: number): number

// Trend analysis (linear regression)
calculateWeightTrend(entries: WeightEntry[], days: number): { slope, intercept } | null

// Forecasting
forecastDate(entries: WeightEntry[], target: number, trendDays: number): Date | null

// Rate calculations
calculateWeeklyRate(entries: WeightEntry[], weeks: number): number | null

// Milestones
getTotalWeightChange(entries: WeightEntry[]): number | null
getLowestWeightDate(entries: WeightEntry[], months: number): { weight, date } | null
getCurrentStreak(entries: WeightEntry[]): number
getLongestStreak(entries: WeightEntry[]): number

// Data validation
hasEnoughData(entries: WeightEntry[], minDays: number): boolean
```

**Dependencies**:
- `date-fns`: Date manipulation and formatting
- Zustand store: Access to weight entries and goals

### Component Architecture

```
InsightsPage
├── GoalSettingsCard (Phase 2)
├── Grid (2 columns on desktop)
│   ├── GoalProgressCard
│   └── ForecastCard
└── MilestonesCard
```

**Data Flow**:
1. Components subscribe to Zustand store (`useWeightStore`)
2. Extract entries and goal from store
3. Call analytics functions with entry data
4. Render results with appropriate UI states

### State Management

**Store Schema**:
```typescript
{
  entries: WeightEntry[],    // All weight entries
  goal: GoalSettings | null  // Current goal (from Phase 2)
}
```

**No additional state needed** - All metrics are computed on-demand from entries.

## UI/UX Design

### Layout
- Tile-based card layout
- Consistent padding (6 units) and spacing (6 units)
- Responsive grid (1 column mobile, 2 columns desktop for progress/forecast)

### Color Scheme
- **Progress**: Green (#10b981)
- **Forecast**: Blue (#3b82f6)
- **Milestones**: Amber (#f59e0b), Purple (#a855f7), Red (#ef4444), Blue (#3b82f6)
- **Warnings**: Amber (#f59e0b)

### Typography
- Card titles: 18px, semibold
- Subtitles: 14px, regular
- Large numbers: 24-32px, bold
- Body text: 14px, regular

### Dark Mode Support
- All components support light/dark themes
- Color variations for dark backgrounds
- Border and background opacity adjustments

## Data Requirements

### Minimum Data for Features

| Feature | Minimum Entries | Notes |
|---------|----------------|-------|
| Progress Percentage | 1 | Requires goal to be set |
| Weekly Rate | 7 | Uses last 14 days if available |
| Forecast | 14 | Requires linear trend |
| Total Change | 2 | First and latest entry |
| Lowest Weight | 1 | Last 6 months |
| Current Streak | 1 | Checks against today |
| Longest Streak | 1 | Historical calculation |

### Progressive Enhancement
- Cards show helpful messages when data is insufficient
- Features unlock as user logs more data
- No error states - only encouraging "need more data" messages

## Edge Cases & Error Handling

### Insufficient Data
- **< 1 entry**: Show empty state on InsightsPage
- **< 14 entries**: Forecast card shows "need more data" message
- **< 2 entries**: Total change shows "N/A"

### Unusual Patterns
- **Weight stable** (no trend): Forecast shows "no trend detected"
- **Weight increasing** (when goal is to decrease): Forecast shows warning
- **Huge weight changes**: No validation - trust user data
- **Gaps in logging**: Current streak resets after 1 day gap

### Goal Scenarios
- **No goal set**: Progress and Forecast cards not rendered
- **Goal already achieved**: Progress shows 100%, forecast may show past date
- **Moving away from goal**: Forecast shows warning message

### Date Edge Cases
- **Forecast > 2 years**: Not displayed (too unreliable)
- **Today's date**: Streak considers entries from yesterday or today as active
- **Time zones**: Uses ISO date strings (YYYY-MM-DD) without time component

## Performance Considerations

### Computation Cost
- Linear regression: O(n) where n = number of entries (max 14)
- Streak calculation: O(n) where n = total entries
- All calculations run on-demand (no caching)
- Typical performance: < 1ms for 100 entries

### Optimization Strategy
- Computations are cheap enough to run on every render
- Components use conditional rendering to avoid unnecessary work
- No memoization needed at this scale

### Bundle Size Impact
- Analytics utilities: ~3KB
- Three new components: ~15KB total
- Total increase: ~20KB (1.8% of bundle)

## Future Enhancements

### Phase 5+ (Not Implemented)
- Day-of-week patterns (heavier on weekends?)
- Plateau detection (stable for X days)
- Month-over-month trends
- Distribution histogram
- Heatmap visualization

### Potential Improvements
- Confidence intervals for forecasts
- Multiple forecast algorithms (exponential smoothing, moving average)
- Customizable streak rules (allow X missed days)
- Achievement notifications
- Export insights as image/PDF

## Testing

### Manual Testing Checklist
- [x] Progress bar updates when weight changes
- [x] Weekly rate shows correct trend direction
- [x] Forecast appears after 14 days of logging
- [x] Forecast handles moving away from goal
- [x] Milestones show correct values
- [x] Current streak increments daily
- [x] Longest streak tracks correctly
- [x] Dark mode renders properly
- [x] Mobile layout is responsive
- [x] Empty states show helpful messages

### Test Scenarios

**Scenario 1: New User (No Data)**
- Result: Empty state on Insights page

**Scenario 2: User with 5 entries**
- Result: Milestones show, forecast shows "need more data"

**Scenario 3: User with 20 entries, losing weight**
- Result: All features visible, positive forecast

**Scenario 4: User with 20 entries, gaining weight (goal is to lose)**
- Result: All features visible, forecast shows warning

**Scenario 5: User with 20 entries, stable weight**
- Result: All features visible, forecast shows "no trend"

## Accessibility

- All cards have semantic headings
- Icons have descriptive labels
- Color is not the only indicator (icons + text)
- Progress bar has ARIA attributes
- Keyboard navigation supported
- Screen reader friendly

## Privacy & Security

- All calculations happen client-side
- No data sent to servers
- No tracking or analytics
- Data stays in localStorage
- Works offline

## Documentation

- Implementation plan: `/IMPLEMENTATION-PLAN.md` (Phase 3)
- Analytics API: JSDoc comments in `src/lib/analytics.ts`
- Component usage: Import and render in InsightsPage

## Success Metrics

If we were tracking (but we're not due to privacy):
- % of users who set goals
- Daily active users (logging frequency)
- Average streak length
- Goal completion rate

## Rollout

- Implemented: 2025-10-14 (Phase 3)
- Deployed: Standalone build (1,084 KB)
- Breaking changes: None
- Migration: None needed (new feature)

## References

- Linear Regression: Standard least-squares method
- Streak Calculation: Consecutive days within 24-hour windows
- Date Handling: ISO 8601 format (YYYY-MM-DD)
