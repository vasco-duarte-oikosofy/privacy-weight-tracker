# Near-Term Features

This document outlines planned features for the Momentum weight tracker app.

## Insights Page (In Planning)

### Overview
A separate page providing analytical insights and goal tracking for weight data. Displayed as a tile-based dashboard with progressive data requirements.

### Core Features

#### 1. Goal-Oriented Metrics (Highest Priority)
- **Goal setting interface**: Set target weight and optional target date
- **Progress visualization**: Circular progress indicator showing % to goal
- **Linear regression forecast**: "At your current pace (-0.3kg/week), you'll reach 70kg by [date]"
- **Milestone tracking**:
  - Total weight lost/gained since start
  - "Lowest weight in X months"
  - Days of tracking streak
- **Data minimum**: 2+ weeks for forecasting

#### 2. Pattern Recognition
- **Day-of-week patterns**: Average weight by day (Mon-Sun) with bar chart
- **Weekly cycles**: Weekday vs. weekend average comparison
- **Month-over-month trends**: Monthly average comparison (if >2 months data)
- **Plateau detection**: Identify when weight stable within ±0.5kg for 7+ days
- **Data minimum**: 2+ weeks for day-of-week patterns

#### 3. Visual Comparisons
- **Distribution histogram**: Weight frequency distribution chart
- **Day-of-week heatmap**: Color-coded grid showing weight patterns by day/week
- **Data minimum**: 2+ weeks for meaningful visualizations

### UX/UI Design
- **Navigation**: New "Insights" tab/page in main navigation
- **Layout**: Single scrollable page with tile-based cards
- **Progressive enhancement**: Show helpful messages when insufficient data ("Log for 2 weeks to see patterns")
- **Goal setting**: Inline on insights page (optional feature, insights work without goals)
- **Mobile-first**: Stacked cards on mobile, grid on desktop

### Data Structure Changes
```typescript
interface GoalSettings {
  targetWeight?: number;      // Target weight in kg
  targetDate?: string;        // Optional target date (YYYY-MM-DD)
  startWeight?: number;       // Weight when goal was set
  startDate?: string;         // Date when goal was set (YYYY-MM-DD)
}
```

### Implementation Phases
1. Navigation & page structure
2. Goal setting UI & storage
3. Goal progress metrics
4. Pattern recognition analytics
5. Visual comparison charts

---

## Future Considerations (Not Yet Planned)
- Export insights as image/PDF
- Customizable tile layout
- Additional statistical metrics
- Correlation with external factors (if user provides context)
