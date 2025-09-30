import { WeightForm } from "@/components/WeightForm";
import { WeightChart } from "@/components/WeightChart";
import { WeightHistory } from "@/components/WeightHistory";
import { useWeightStore } from "@/hooks/use-weight-store";
import { Toaster } from "@/components/ui/sonner";
import { Target } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/use-theme";
const EmptyState = () => (
  <div className="text-center py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 animate-fade-in">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
      <Target className="h-6 w-6 text-slate-500 dark:text-slate-400" />
    </div>
    <h3 className="mt-5 text-2xl font-semibold text-slate-900 dark:text-slate-100">
      Start Your Journey
    </h3>
    <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
      Log your first weight entry above to begin tracking your progress.
    </p>
  </div>
);
export function HomePage() {
  const entries = useWeightStore((state) => state.entries);
  const { isDark } = useTheme();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <main className="container mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <header className="text-center mb-12">
          <h1 className="font-display text-5xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Momentum
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            A privacy-first, on-device visual weight tracker.
          </p>
        </header>
        <div className="space-y-8">
          <WeightForm />
          {entries.length > 0 ? (
            <>
              <WeightChart />
              <WeightHistory />
            </>
          ) : (
            <EmptyState />
          )}
        </div>
        <footer className="text-center mt-16 text-sm text-slate-500 dark:text-slate-500">
          <p>Built with ❤️ at Cloudflare</p>
        </footer>
      </main>
      <Toaster richColors closeButton theme={isDark ? 'dark' : 'light'} />
    </div>
  );
}