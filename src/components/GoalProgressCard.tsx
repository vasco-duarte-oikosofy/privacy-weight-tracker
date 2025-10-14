import { Target, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { useWeightStore } from "@/hooks/use-weight-store";
import { calculateProgress, calculateWeeklyRate } from "@/lib/analytics";
import { Progress } from "@/components/ui/progress";

export function GoalProgressCard() {
  const entries = useWeightStore((state) => state.entries);
  const goal = useWeightStore((state) => state.goal);

  if (!goal || !goal.targetWeight || entries.length === 0) {
    return null;
  }

  const latestEntry = entries[entries.length - 1];
  const currentWeight = latestEntry.weight;
  const progress = calculateProgress(currentWeight, goal.startWeight, goal.targetWeight);
  const weeklyRate = calculateWeeklyRate(entries, 2);

  const weightRemaining = Math.abs(currentWeight - goal.targetWeight);
  const isLosingWeight = currentWeight < (goal.startWeight || currentWeight);
  const isGainingWeight = currentWeight > (goal.startWeight || currentWeight);

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Goal Progress
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track your progress toward your target
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Progress
            </span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              {progress.toFixed(1)}%
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">Current</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {currentWeight.toFixed(1)} kg
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">Target</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {goal.targetWeight.toFixed(1)} kg
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">Remaining</p>
            <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
              {weightRemaining.toFixed(1)} kg
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">Weekly Rate</p>
            {weeklyRate !== null ? (
              <div className="flex items-center gap-1">
                {weeklyRate < -0.1 ? (
                  <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : weeklyRate > 0.1 ? (
                  <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                ) : (
                  <Minus className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                )}
                <p className={`text-lg font-semibold ${
                  weeklyRate < -0.1
                    ? 'text-green-600 dark:text-green-400'
                    : weeklyRate > 0.1
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {Math.abs(weeklyRate).toFixed(2)} kg/wk
                </p>
              </div>
            ) : (
              <p className="text-lg font-semibold text-slate-400 dark:text-slate-500">
                N/A
              </p>
            )}
          </div>
        </div>

        {/* Insight message */}
        {weeklyRate !== null && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {weeklyRate < -0.1 && isLosingWeight && (
                <>You're losing <strong>{Math.abs(weeklyRate).toFixed(2)} kg</strong> per week on average. Keep up the great work!</>
              )}
              {weeklyRate > 0.1 && isGainingWeight && (
                <>You're gaining <strong>{weeklyRate.toFixed(2)} kg</strong> per week on average. Stay focused on your goal!</>
              )}
              {Math.abs(weeklyRate) <= 0.1 && (
                <>Your weight has been stable over the past 2 weeks.</>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
