import { useWeightStore } from "@/hooks/use-weight-store";
import { TrendingUp } from "lucide-react";
import { GoalSettingsCard } from "@/components/GoalSettingsCard";
import { GoalProgressCard } from "@/components/GoalProgressCard";
import { ForecastCard } from "@/components/ForecastCard";
import { MilestonesCard } from "@/components/MilestonesCard";
import { DayOfWeekCard } from "@/components/DayOfWeekCard";
import { WeeklyCycleCard } from "@/components/WeeklyCycleCard";
import { PlateauCard } from "@/components/PlateauCard";
import { DistributionCard } from "@/components/DistributionCard";
import { HeatmapCard } from "@/components/HeatmapCard";

const EmptyState = () => (
  <div className="text-center py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 animate-fade-in">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
      <TrendingUp className="h-6 w-6 text-slate-500 dark:text-slate-400" />
    </div>
    <h3 className="mt-5 text-2xl font-semibold text-slate-900 dark:text-slate-100">
      No Data Yet
    </h3>
    <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
      Add weight entries on the Home page to see insights and analytics here.
    </p>
  </div>
);

export function InsightsPage() {
  const entries = useWeightStore((state) => state.entries);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950 text-slate-800 dark:text-slate-200 font-sans">
      <main className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
            Insights
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Track your progress and discover patterns in your weight journey.
          </p>
        </header>

        {entries.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {/* Goal Settings */}
            <GoalSettingsCard />

            {/* Goal Progress & Forecast */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GoalProgressCard />
              <ForecastCard />
            </div>

            {/* Milestones */}
            <MilestonesCard />

            {/* Pattern Recognition */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-8">
                Patterns & Trends
              </h2>

              {/* Day of Week & Weekly Cycle */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DayOfWeekCard />
                <WeeklyCycleCard />
              </div>

              {/* Plateau Detection */}
              <PlateauCard />
            </div>

            {/* Visual Analysis */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-8">
                Visual Analysis
              </h2>

              {/* Distribution & Heatmap */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DistributionCard />
                <HeatmapCard />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
