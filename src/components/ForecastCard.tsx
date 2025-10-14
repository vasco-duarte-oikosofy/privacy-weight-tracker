import { Calendar, AlertCircle } from "lucide-react";
import { useWeightStore } from "@/hooks/use-weight-store";
import { forecastDate, hasEnoughData } from "@/lib/analytics";
import { format, parseISO } from "date-fns";

export function ForecastCard() {
  const entries = useWeightStore((state) => state.entries);
  const goal = useWeightStore((state) => state.goal);

  if (!goal || !goal.targetWeight || entries.length === 0) {
    return null;
  }

  const enoughData = hasEnoughData(entries, 14);

  if (!enoughData) {
    return (
      <div className="bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Goal Forecast
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Predicted completion date
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Log weight for at least 14 days to see a forecast based on your progress trend.
          </p>
        </div>
      </div>
    );
  }

  const forecastedDate = forecastDate(entries, goal.targetWeight, 14);
  const latestEntry = entries[entries.length - 1];
  const currentWeight = latestEntry.weight;
  const isMovingTowardGoal = forecastedDate !== null;

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Goal Forecast
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Predicted completion date
          </p>
        </div>
      </div>

      {isMovingTowardGoal ? (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              At your current pace, you'll reach your goal of
            </p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {goal.targetWeight.toFixed(1)} kg
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              by approximately
            </p>
            <p className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-1">
              {format(forecastedDate, "MMMM dd, yyyy")}
            </p>
          </div>

          {goal.targetDate && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Your target date:
              </p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {format(parseISO(goal.targetDate), "MMMM dd, yyyy")}
              </p>
            </div>
          )}

          <p className="text-xs text-slate-500 dark:text-slate-400">
            This forecast is based on your weight trend over the last 14 days. Results may vary depending on your ongoing progress.
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
              Unable to forecast
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-300">
              {currentWeight > goal.targetWeight ? (
                <>Your weight is currently moving away from your goal. Keep working on your plan!</>
              ) : (
                <>Not enough trend data yet. Continue logging your weight to see a forecast.</>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
