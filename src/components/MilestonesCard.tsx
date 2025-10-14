import { Award, TrendingDown, TrendingUp, Calendar, Flame } from "lucide-react";
import { useWeightStore } from "@/hooks/use-weight-store";
import {
  getTotalWeightChange,
  getLowestWeightDate,
  getCurrentStreak,
  getLongestStreak,
} from "@/lib/analytics";
import { format, parseISO } from "date-fns";

export function MilestonesCard() {
  const entries = useWeightStore((state) => state.entries);

  if (entries.length === 0) {
    return null;
  }

  const totalChange = getTotalWeightChange(entries);
  const lowestWeight = getLowestWeightDate(entries, 6);
  const currentStreak = getCurrentStreak(entries);
  const longestStreak = getLongestStreak(entries);

  const milestones = [
    {
      icon: totalChange && totalChange < 0 ? TrendingDown : TrendingUp,
      color: totalChange && totalChange < 0 ? "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30" : "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30",
      label: "Total Change",
      value: totalChange ? `${totalChange > 0 ? '+' : ''}${totalChange.toFixed(1)} kg` : "N/A",
      description: totalChange
        ? totalChange < 0
          ? "since you started"
          : "since you started"
        : null,
    },
    {
      icon: Award,
      color: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30",
      label: "Lowest in 6 Months",
      value: lowestWeight ? `${lowestWeight.weight.toFixed(1)} kg` : "N/A",
      description: lowestWeight
        ? `on ${format(parseISO(lowestWeight.date), "MMM dd, yyyy")}`
        : null,
    },
    {
      icon: Flame,
      color: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30",
      label: "Current Streak",
      value: currentStreak > 0 ? `${currentStreak} ${currentStreak === 1 ? 'day' : 'days'}` : "0 days",
      description: currentStreak > 0 ? "Keep it going!" : "Log today to start",
    },
    {
      icon: Calendar,
      color: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
      label: "Longest Streak",
      value: `${longestStreak} ${longestStreak === 1 ? 'day' : 'days'}`,
      description: longestStreak === currentStreak && currentStreak > 1 ? "New record!" : "Your best run",
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Milestones
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your achievements and progress
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {milestones.map((milestone, index) => {
          const Icon = milestone.icon;
          return (
            <div
              key={index}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${milestone.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    {milestone.label}
                  </p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {milestone.value}
                  </p>
                  {milestone.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {milestone.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
