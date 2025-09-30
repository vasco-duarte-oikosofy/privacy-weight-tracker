import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
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
  const chartData = entries.map(entry => ({
    ...entry,
    date: format(new Date(entry.date), 'MMM d'),
    weight: parseFloat(entry.weight.toFixed(1)),
  }));
  const weights = entries.map(e => e.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
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
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
                width={40}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
              <Bar dataKey="weight" fill="rgb(71 85 105)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}