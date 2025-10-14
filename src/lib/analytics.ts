import { WeightEntry, GoalSettings } from "@/hooks/use-weight-store";
import { differenceInDays, parseISO, addDays, format } from "date-fns";

/**
 * Calculate progress percentage toward goal
 */
export function calculateProgress(
  currentWeight: number,
  startWeight: number | undefined,
  targetWeight: number
): number {
  if (!startWeight) return 0;

  const totalChange = targetWeight - startWeight;
  const currentChange = currentWeight - startWeight;

  if (totalChange === 0) return 100;

  const progress = (currentChange / totalChange) * 100;
  return Math.max(0, Math.min(100, progress));
}

/**
 * Calculate weight trend using linear regression
 * Returns slope (kg per day) and intercept
 */
export function calculateWeightTrend(
  entries: WeightEntry[],
  days: number = 14
): { slope: number; intercept: number } | null {
  if (entries.length < 2) return null;

  // Get recent entries
  const recentEntries = entries.slice(-days);
  if (recentEntries.length < 2) return null;

  // Convert dates to days since first entry
  const firstDate = parseISO(recentEntries[0].date);
  const points = recentEntries.map((entry) => ({
    x: differenceInDays(parseISO(entry.date), firstDate),
    y: entry.weight,
  }));

  // Calculate linear regression
  const n = points.length;
  const sumX = points.reduce((sum, p) => sum + p.x, 0);
  const sumY = points.reduce((sum, p) => sum + p.y, 0);
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * Forecast date when target weight will be reached
 */
export function forecastDate(
  entries: WeightEntry[],
  targetWeight: number,
  trendDays: number = 14
): Date | null {
  const trend = calculateWeightTrend(entries, trendDays);
  if (!trend || Math.abs(trend.slope) < 0.001) return null; // No significant trend

  const latestEntry = entries[entries.length - 1];
  const currentWeight = latestEntry.weight;
  const currentDate = parseISO(latestEntry.date);

  // Calculate days needed to reach target
  const weightDifference = targetWeight - currentWeight;
  const daysNeeded = weightDifference / trend.slope;

  // Check if we're moving toward the goal
  if (daysNeeded < 0) return null; // Moving away from goal

  // Don't forecast too far into the future (max 2 years)
  if (daysNeeded > 730) return null;

  return addDays(currentDate, Math.round(daysNeeded));
}

/**
 * Calculate weekly rate of weight change
 */
export function calculateWeeklyRate(
  entries: WeightEntry[],
  weeks: number = 2
): number | null {
  const days = weeks * 7;
  const recentEntries = entries.slice(-days);

  if (recentEntries.length < 2) return null;

  const firstWeight = recentEntries[0].weight;
  const lastWeight = recentEntries[recentEntries.length - 1].weight;
  const firstDate = parseISO(recentEntries[0].date);
  const lastDate = parseISO(recentEntries[recentEntries.length - 1].date);

  const daysDiff = differenceInDays(lastDate, firstDate);
  if (daysDiff === 0) return null;

  const weightChange = lastWeight - firstWeight;
  const weeklyRate = (weightChange / daysDiff) * 7;

  return weeklyRate;
}

/**
 * Get total weight change since start
 */
export function getTotalWeightChange(entries: WeightEntry[]): number | null {
  if (entries.length < 2) return null;
  return entries[entries.length - 1].weight - entries[0].weight;
}

/**
 * Find lowest weight within a timeframe
 */
export function getLowestWeightDate(
  entries: WeightEntry[],
  months: number = 6
): { weight: number; date: string } | null {
  if (entries.length === 0) return null;

  const today = new Date();
  const cutoffDate = addDays(today, -months * 30);

  const recentEntries = entries.filter(
    (entry) => parseISO(entry.date) >= cutoffDate
  );

  if (recentEntries.length === 0) return null;

  const lowest = recentEntries.reduce((min, entry) =>
    entry.weight < min.weight ? entry : min
  );

  return { weight: lowest.weight, date: lowest.date };
}

/**
 * Calculate current consecutive logging streak
 */
export function getCurrentStreak(entries: WeightEntry[]): number {
  if (entries.length === 0) return 0;

  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if there's an entry today or yesterday
  const latestDate = parseISO(entries[entries.length - 1].date);
  latestDate.setHours(0, 0, 0, 0);
  const daysSinceLatest = differenceInDays(today, latestDate);

  if (daysSinceLatest > 1) return 0; // Streak broken

  // Count consecutive days backwards
  for (let i = entries.length - 2; i >= 0; i--) {
    const currentDate = parseISO(entries[i + 1].date);
    const prevDate = parseISO(entries[i].date);
    const diff = differenceInDays(currentDate, prevDate);

    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate longest logging streak
 */
export function getLongestStreak(entries: WeightEntry[]): number {
  if (entries.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < entries.length; i++) {
    const currentDate = parseISO(entries[i].date);
    const prevDate = parseISO(entries[i - 1].date);
    const diff = differenceInDays(currentDate, prevDate);

    if (diff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

/**
 * Check if user needs more data for meaningful insights
 */
export function hasEnoughData(entries: WeightEntry[], minDays: number = 14): boolean {
  return entries.length >= minDays;
}

/**
 * Get average weight by day of week
 */
export function getAverageByDayOfWeek(entries: WeightEntry[]): Record<string, number> {
  if (entries.length === 0) {
    return {};
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayTotals: Record<number, { sum: number; count: number }> = {};

  // Initialize all days
  for (let i = 0; i < 7; i++) {
    dayTotals[i] = { sum: 0, count: 0 };
  }

  // Sum up weights by day
  entries.forEach((entry) => {
    const date = parseISO(entry.date);
    const dayOfWeek = date.getDay();
    dayTotals[dayOfWeek].sum += entry.weight;
    dayTotals[dayOfWeek].count += 1;
  });

  // Calculate averages
  const result: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const dayName = dayNames[i];
    if (dayTotals[i].count > 0) {
      result[dayName] = dayTotals[i].sum / dayTotals[i].count;
    }
  }

  return result;
}

/**
 * Compare weekday vs. weekend average weights
 */
export function getWeekdayVsWeekendAverage(entries: WeightEntry[]): {
  weekday: number;
  weekend: number;
  diff: number;
} | null {
  if (entries.length === 0) return null;

  let weekdaySum = 0;
  let weekdayCount = 0;
  let weekendSum = 0;
  let weekendCount = 0;

  entries.forEach((entry) => {
    const date = parseISO(entry.date);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekend (Sunday = 0, Saturday = 6)
      weekendSum += entry.weight;
      weekendCount += 1;
    } else {
      // Weekday
      weekdaySum += entry.weight;
      weekdayCount += 1;
    }
  });

  if (weekdayCount === 0 || weekendCount === 0) return null;

  const weekdayAvg = weekdaySum / weekdayCount;
  const weekendAvg = weekendSum / weekendCount;
  const diff = weekendAvg - weekdayAvg;

  return {
    weekday: weekdayAvg,
    weekend: weekendAvg,
    diff,
  };
}

/**
 * Get monthly averages
 */
export function getMonthlyAverages(entries: WeightEntry[]): Array<{ month: string; avg: number }> {
  if (entries.length === 0) return [];

  const monthlyData: Record<string, { sum: number; count: number }> = {};

  entries.forEach((entry) => {
    const date = parseISO(entry.date);
    const monthKey = format(date, "yyyy-MM"); // e.g., "2025-01"

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { sum: 0, count: 0 };
    }

    monthlyData[monthKey].sum += entry.weight;
    monthlyData[monthKey].count += 1;
  });

  // Convert to array and calculate averages
  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      avg: data.sum / data.count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Detect plateaus (periods of stable weight)
 */
export function detectPlateau(
  entries: WeightEntry[],
  thresholdKg: number = 0.5,
  minDays: number = 7
): Array<{ start: string; end: string; avgWeight: number; days: number }> {
  if (entries.length < minDays) return [];

  const plateaus: Array<{ start: string; end: string; avgWeight: number; days: number }> = [];
  let plateauStart = 0;

  for (let i = 1; i < entries.length; i++) {
    const plateauEntries = entries.slice(plateauStart, i + 1);
    const weights = plateauEntries.map((e) => e.weight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const range = maxWeight - minWeight;

    // If range exceeds threshold, end current plateau
    if (range > thresholdKg) {
      // Check if previous plateau was long enough
      if (i - plateauStart >= minDays) {
        const plateauSlice = entries.slice(plateauStart, i);
        const avgWeight =
          plateauSlice.reduce((sum, e) => sum + e.weight, 0) / plateauSlice.length;

        plateaus.push({
          start: entries[plateauStart].date,
          end: entries[i - 1].date,
          avgWeight,
          days: i - plateauStart,
        });
      }
      plateauStart = i;
    }
  }

  // Check final plateau
  if (entries.length - plateauStart >= minDays) {
    const plateauSlice = entries.slice(plateauStart);
    const avgWeight =
      plateauSlice.reduce((sum, e) => sum + e.weight, 0) / plateauSlice.length;

    plateaus.push({
      start: entries[plateauStart].date,
      end: entries[entries.length - 1].date,
      avgWeight,
      days: entries.length - plateauStart,
    });
  }

  return plateaus;
}

/**
 * Get weight distribution for histogram
 * Groups weights into buckets and counts occurrences
 */
export function getWeightDistribution(
  entries: WeightEntry[],
  bucketSize: number = 0.5
): Array<{ range: string; count: number; minWeight: number; maxWeight: number }> {
  if (entries.length === 0) return [];

  const weights = entries.map((e) => e.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);

  // Create buckets
  const buckets: Record<string, { count: number; min: number; max: number }> = {};

  entries.forEach((entry) => {
    const bucketMin = Math.floor(entry.weight / bucketSize) * bucketSize;
    const bucketMax = bucketMin + bucketSize;
    const key = `${bucketMin.toFixed(1)}-${bucketMax.toFixed(1)}`;

    if (!buckets[key]) {
      buckets[key] = { count: 0, min: bucketMin, max: bucketMax };
    }
    buckets[key].count += 1;
  });

  // Convert to sorted array
  return Object.entries(buckets)
    .map(([range, data]) => ({
      range,
      count: data.count,
      minWeight: data.min,
      maxWeight: data.max,
    }))
    .sort((a, b) => a.minWeight - b.minWeight);
}

/**
 * Get heatmap data for calendar visualization
 * Returns entries grouped by week with day-of-week positioning
 */
export function getHeatmapData(
  entries: WeightEntry[]
): Array<{ date: string; weight: number; dayOfWeek: number; weekNumber: number }> {
  if (entries.length === 0) return [];

  const firstDate = parseISO(entries[0].date);

  return entries.map((entry) => {
    const date = parseISO(entry.date);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const weekNumber = Math.floor(differenceInDays(date, firstDate) / 7);

    return {
      date: entry.date,
      weight: entry.weight,
      dayOfWeek,
      weekNumber,
    };
  });
}
