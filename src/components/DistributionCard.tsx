import { BarChart2 } from "lucide-react";
import { useWeightStore } from "@/hooks/use-weight-store";
import { getWeightDistribution, hasEnoughData } from "@/lib/analytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export function DistributionCard() {
  const entries = useWeightStore((state) => state.entries);

  if (!hasEnoughData(entries, 14)) {
    return null;
  }

  const distribution = getWeightDistribution(entries, 0.5);

  if (distribution.length === 0) {
    return null;
  }

  // Find most common range and median
  const sortedByCount = [...distribution].sort((a, b) => b.count - a.count);
  const mostCommon = sortedByCount[0];

  // Calculate median weight
  const allWeights = entries.map((e) => e.weight).sort((a, b) => a - b);
  const medianWeight = allWeights[Math.floor(allWeights.length / 2)];

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <BarChart2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Weight Distribution
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            How often you've been at each weight
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Histogram */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distribution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
              <XAxis
                dataKey="range"
                stroke="#64748b"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                label={{ value: 'Days', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value} days`, 'Frequency']}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {distribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.range === mostCommon.range
                        ? '#10b981' // Green for most common
                        : '#6366f1' // Indigo for others
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Statistics */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">Most Common Range</p>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {mostCommon.range} kg
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {mostCommon.count} {mostCommon.count === 1 ? 'day' : 'days'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">Median Weight</p>
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {medianWeight.toFixed(2)} kg
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Middle value
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
            You've logged <strong>{entries.length} days</strong> of data, with weights ranging from{' '}
            <strong>{Math.min(...allWeights).toFixed(1)} kg</strong> to{' '}
            <strong>{Math.max(...allWeights).toFixed(1)} kg</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
