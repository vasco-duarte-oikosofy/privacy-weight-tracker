import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useWeightStore } from "@/hooks/use-weight-store";
import { getWeekdayVsWeekendAverage, hasEnoughData } from "@/lib/analytics";

export function WeeklyCycleCard() {
  const entries = useWeightStore((state) => state.entries);

  if (!hasEnoughData(entries, 14)) {
    return null;
  }

  const comparison = getWeekdayVsWeekendAverage(entries);

  if (!comparison) {
    return null;
  }

  const { weekday, weekend, diff } = comparison;
  const isWeekendHeavier = diff > 0.1;
  const isWeekdayHeavier = diff < -0.1;
  const isStable = Math.abs(diff) <= 0.1;

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
          {isWeekendHeavier ? (
            <TrendingUp className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          ) : isWeekdayHeavier ? (
            <TrendingDown className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          ) : (
            <Minus className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Weekly Cycle
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Weekday vs. weekend comparison
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Comparison Bars */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Weekdays (Mon-Fri)
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {weekday.toFixed(2)} kg
              </span>
            </div>
            <div className="relative h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all"
                style={{
                  width: `${(weekday / Math.max(weekday, weekend)) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Weekends (Sat-Sun)
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {weekend.toFixed(2)} kg
              </span>
            </div>
            <div className="relative h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-violet-500 dark:bg-violet-400 rounded-full transition-all"
                style={{
                  width: `${(weekend / Math.max(weekday, weekend)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Difference Indicator */}
        <div className={`p-4 rounded-lg border ${
          isWeekendHeavier
            ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800'
            : isWeekdayHeavier
            ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {isWeekendHeavier ? (
              <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            ) : isWeekdayHeavier ? (
              <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <Minus className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            )}
            <span className={`font-semibold ${
              isWeekendHeavier
                ? 'text-orange-900 dark:text-orange-200'
                : isWeekdayHeavier
                ? 'text-green-900 dark:text-green-200'
                : 'text-slate-900 dark:text-slate-200'
            }`}>
              {Math.abs(diff).toFixed(2)} kg difference
            </span>
          </div>
          <p className={`text-sm ${
            isWeekendHeavier
              ? 'text-orange-800 dark:text-orange-300'
              : isWeekdayHeavier
              ? 'text-green-800 dark:text-green-300'
              : 'text-slate-600 dark:text-slate-400'
          }`}>
            {isWeekendHeavier && (
              <>Your weight typically <strong>increases by {diff.toFixed(2)} kg</strong> on weekends compared to weekdays.</>
            )}
            {isWeekdayHeavier && (
              <>Your weight is typically <strong>{Math.abs(diff).toFixed(2)} kg lighter</strong> on weekends compared to weekdays.</>
            )}
            {isStable && (
              <>Your weight remains <strong>consistent</strong> throughout the week, with minimal variation between weekdays and weekends.</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
