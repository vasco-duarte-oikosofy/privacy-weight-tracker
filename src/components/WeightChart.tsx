import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Brush } from 'recharts';
import { format, eachDayOfInterval, parseISO, subDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWeightStore } from "@/hooks/use-weight-store";
import { TrendingUp } from 'lucide-react';
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
            <span className="font-bold text-muted-foreground">{label}</span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">Weight</span>
            <span className="font-bold">{`${payload[0].value.toFixed(1)} kg`}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};
export function WeightChart() {
  const entries = useWeightStore((state) => state.entries);
  // The chart should not render if there are no entries.
  // The parent component handles the empty state.
  if (entries.length === 0) {
    return null;
  }
  // Create a map of date strings to entries for quick lookup
  const entriesMap = new Map(entries.map(e => [e.date, e]));

  // Get the date range - show from earliest entry to today
  const firstDate = parseISO(entries[0].date);
  const today = new Date();

  // Generate all dates in the range
  const allDates = eachDayOfInterval({ start: firstDate, end: today });

  // Calculate default view (last 30 days)
  const defaultStartIndex = Math.max(0, allDates.length - 30);
  const defaultEndIndex = allDates.length - 1;

  // Create chart data with gaps for missing dates
  const chartData = allDates.map((date, index) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = entriesMap.get(dateStr);

    if (!entry) {
      // Missing date - show gap
      return {
        date: format(date, 'MMM d'),
        weight: null,
        fill: 'transparent'
      };
    }

    // Find previous actual entry (not null) for color comparison
    let prevWeight = null;
    for (let i = index - 1; i >= 0; i--) {
      const prevDateStr = format(allDates[i], 'yyyy-MM-dd');
      const prevEntry = entriesMap.get(prevDateStr);
      if (prevEntry) {
        prevWeight = prevEntry.weight;
        break;
      }
    }

    return {
      date: format(date, 'MMM d'),
      weight: parseFloat(entry.weight.toFixed(1)),
      fill: prevWeight === null ? 'rgb(71 85 105)' : entry.weight < prevWeight ? 'rgb(34 197 94)' : 'rgb(71 85 105)'
    };
  });
  const weights = entries.map(e => e.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);

  // Calculate average and standard deviation
  const average = weights.reduce((sum, w) => sum + w, 0) / weights.length;
  const variance = weights.reduce((sum, w) => sum + Math.pow(w - average, 2), 0) / weights.length;
  const stdDev = Math.sqrt(variance);

  const upperControlLine = average + stdDev;
  const lowerControlLine = average - stdDev;

  // Handle domain calculation gracefully for single or multiple data points.
  // If min and max are the same, create a sensible range around that value.
  const yAxisDomain = [
    Math.floor(minWeight * 0.9),
    minWeight === maxWeight ? Math.ceil(maxWeight * 1.1) + 1 : Math.ceil(maxWeight * 1.1)
  ];
  return (
    <Card className="w-full animate-fade-in" style={{ animationDelay: '150ms' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-slate-800 dark:text-slate-200">
          <TrendingUp className="h-6 w-6 text-slate-500" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 60, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}kg`}
                domain={yAxisDomain}
                allowDataOverflow={true}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
              <Bar dataKey="weight" radius={[4, 4, 0, 0]} />
              <ReferenceLine
                y={upperControlLine}
                stroke="rgb(239 68 68)"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                isFront={true}
                label={{ value: `${upperControlLine.toFixed(1)}kg`, position: 'right', fill: 'rgb(239 68 68)', fontSize: 12 }}
              />
              <ReferenceLine
                y={lowerControlLine}
                stroke="rgb(239 68 68)"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                isFront={true}
                label={{ value: `${lowerControlLine.toFixed(1)}kg`, position: 'right', fill: 'rgb(239 68 68)', fontSize: 12 }}
              />
              <Brush
                dataKey="date"
                height={30}
                stroke="hsl(var(--border))"
                fill="hsl(var(--muted))"
                startIndex={defaultStartIndex}
                endIndex={defaultEndIndex}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}