import { Activity, AlertCircle } from "lucide-react";
import { useWeightStore } from "@/hooks/use-weight-store";
import { detectPlateau, hasEnoughData } from "@/lib/analytics";
import { format, parseISO } from "date-fns";

export function PlateauCard() {
  const entries = useWeightStore((state) => state.entries);

  if (!hasEnoughData(entries, 14)) {
    return null;
  }

  const plateaus = detectPlateau(entries, 0.5, 7);

  // Get the most recent 3 plateaus
  const recentPlateaus = plateaus.slice(-3).reverse();

  // Check if currently in a plateau (last plateau ends with latest entry)
  const currentPlateau =
    plateaus.length > 0 &&
    plateaus[plateaus.length - 1].end === entries[entries.length - 1].date
      ? plateaus[plateaus.length - 1]
      : null;

  if (plateaus.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
            <Activity className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Plateau Detection
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Periods of stable weight
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
          <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800 dark:text-green-300">
            No plateaus detected. Your weight has been consistently changing, which is great for progress!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
          <Activity className="h-5 w-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Plateau Detection
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Periods of stable weight (±0.5kg)
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Current Plateau Alert */}
        {currentPlateau && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">
                  Currently in a plateau
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Your weight has been stable at around <strong>{currentPlateau.avgWeight.toFixed(1)} kg</strong> for{" "}
                  <strong>{currentPlateau.days} days</strong> ({format(parseISO(currentPlateau.start), "MMM dd")} -{" "}
                  {format(parseISO(currentPlateau.end), "MMM dd")}).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Plateaus List */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {currentPlateau ? "Previous Plateaus" : "Recent Plateaus"}
          </h4>
          {recentPlateaus.map((plateau, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {plateau.days} days
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      at ~{plateau.avgWeight.toFixed(1)} kg
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {format(parseISO(plateau.start), "MMM dd, yyyy")} -{" "}
                    {format(parseISO(plateau.end), "MMM dd, yyyy")}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="px-2 py-1 bg-teal-100 dark:bg-teal-900/30 rounded text-xs font-medium text-teal-700 dark:text-teal-300">
                    Stable
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!currentPlateau && plateaus.length > 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
            A plateau is detected when weight stays within ±0.5kg for 7+ consecutive days.
          </p>
        )}
      </div>
    </div>
  );
}
