import { Calendar } from "lucide-react";
import { useWeightStore } from "@/hooks/use-weight-store";
import { getHeatmapData, hasEnoughData } from "@/lib/analytics";
import { format, parseISO } from "date-fns";
import { useState } from "react";

export function HeatmapCard() {
  const entries = useWeightStore((state) => state.entries);
  const [hoveredCell, setHoveredCell] = useState<{ date: string; weight: number } | null>(null);

  if (!hasEnoughData(entries, 14)) {
    return null;
  }

  const heatmapData = getHeatmapData(entries);

  if (heatmapData.length === 0) {
    return null;
  }

  // Calculate color intensity based on weight
  const weights = entries.map((e) => e.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const weightRange = maxWeight - minWeight;

  // Get weight color (green for lower, orange for higher)
  const getWeightColor = (weight: number) => {
    if (weightRange === 0) return 'bg-indigo-500 dark:bg-indigo-600';

    const normalized = (weight - minWeight) / weightRange;

    if (normalized < 0.2) return 'bg-green-300 dark:bg-green-700';
    if (normalized < 0.4) return 'bg-green-400 dark:bg-green-600';
    if (normalized < 0.6) return 'bg-yellow-400 dark:bg-yellow-600';
    if (normalized < 0.8) return 'bg-orange-400 dark:bg-orange-600';
    return 'bg-orange-500 dark:bg-orange-700';
  };

  // Organize data by week and day
  const maxWeek = Math.max(...heatmapData.map((d) => d.weekNumber));
  const weeks: Array<Array<{ date: string; weight: number; dayOfWeek: number } | null>> = [];

  for (let week = 0; week <= maxWeek; week++) {
    const weekData: Array<{ date: string; weight: number; dayOfWeek: number } | null> = Array(7).fill(null);
    heatmapData
      .filter((d) => d.weekNumber === week)
      .forEach((d) => {
        weekData[d.dayOfWeek] = { date: d.date, weight: d.weight, dayOfWeek: d.dayOfWeek };
      });
    weeks.push(weekData);
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
          <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Weight Calendar
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Visual timeline of your weight journey
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Day labels */}
        <div className="flex gap-1 justify-start pl-12">
          {dayLabels.map((day) => (
            <div
              key={day}
              className="text-xs font-medium text-slate-600 dark:text-slate-400 w-8 text-center"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="space-y-1 overflow-x-auto">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex gap-1 items-center">
              <span className="text-xs text-slate-500 dark:text-slate-400 w-10 text-right pr-2">
                W{weekIndex + 1}
              </span>
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-8 h-8 rounded-sm transition-all ${
                    day
                      ? `${getWeightColor(day.weight)} cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-slate-400 dark:hover:ring-slate-500`
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                  onMouseEnter={() => day && setHoveredCell({ date: day.date, weight: day.weight })}
                  onMouseLeave={() => setHoveredCell(null)}
                  title={day ? `${format(parseISO(day.date), 'MMM dd, yyyy')}: ${day.weight.toFixed(2)} kg` : ''}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Hover tooltip */}
        {hoveredCell && (
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {format(parseISO(hoveredCell.date), 'EEEE, MMM dd, yyyy')}
            </p>
            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {hoveredCell.weight.toFixed(2)} kg
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-600 dark:text-slate-400">Lower</span>
            <div className="flex gap-1">
              <div className="w-6 h-4 rounded bg-green-300 dark:bg-green-700" />
              <div className="w-6 h-4 rounded bg-green-400 dark:bg-green-600" />
              <div className="w-6 h-4 rounded bg-yellow-400 dark:bg-yellow-600" />
              <div className="w-6 h-4 rounded bg-orange-400 dark:bg-orange-600" />
              <div className="w-6 h-4 rounded bg-orange-500 dark:bg-orange-700" />
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400">Higher</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
            Range: {minWeight.toFixed(1)} - {maxWeight.toFixed(1)} kg
          </p>
        </div>
      </div>
    </div>
  );
}
