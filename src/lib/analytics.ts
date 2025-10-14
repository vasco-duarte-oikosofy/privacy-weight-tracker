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
