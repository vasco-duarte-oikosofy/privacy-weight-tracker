import { Calendar } from "lucide-react";
import { useWeightStore } from "@/hooks/use-weight-store";
import { getAverageByDayOfWeek, hasEnoughData } from "@/lib/analytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export function DayOfWeekCard() {
  const entries = useWeightStore((state) => state.entries);

  if (!hasEnoughData(entries, 14)) {
    return null;
  }

  const averagesByDay = getAverageByDayOfWeek(entries);

  // Order days from Monday to Sunday for better readability
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const chartData = dayOrder
    .filter(day => averagesByDay[day] !== undefined)
    .map(day => ({
      day: day.substring(0, 3), // Short name (Mon, Tue, etc.)
      weight: averagesByDay[day],
      fullDay: day,
    }));

  if (chartData.length === 0) {
    return null;
  }

  // Find highest and lowest
  const weights = chartData.map(d => d.weight);
  const maxWeight = Math.max(...weights);
  const minWeight = Math.min(...weights);
  const heaviestDay = chartData.find(d => d.weight === maxWeight)?.fullDay;
  const lightestDay = chartData.find(d => d.weight === minWeight)?.fullDay;

  // Calculate Y-axis domain with padding
  const yMin = Math.floor(minWeight - 1);
  const yMax = Math.ceil(maxWeight + 1);

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
          <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Day of Week Patterns
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your average weight by day
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
              <XAxis
                dataKey="day"
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                domain={[yMin, yMax]}
                tickFormatter={(value) => `${value.toFixed(1)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value.toFixed(2)} kg`, 'Avg Weight']}
                labelFormatter={(label) => chartData.find(d => d.day === label)?.fullDay || label}
              />
              <Bar dataKey="weight" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.weight === maxWeight
                        ? '#f97316' // Orange for heaviest
                        : entry.weight === minWeight
                        ? '#10b981' // Green for lightest
                        : '#6366f1' // Indigo for others
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">Lightest Day</p>
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                {lightestDay}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {minWeight.toFixed(2)} kg
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">Heaviest Day</p>
              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                {heaviestDay}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {maxWeight.toFixed(2)} kg
              </p>
            </div>
          </div>
          {maxWeight - minWeight > 0.3 && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
              Your weight varies by <strong>{(maxWeight - minWeight).toFixed(2)} kg</strong> throughout the week,
              with {lightestDay}s being your lightest day.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
