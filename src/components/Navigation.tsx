import { Home, TrendingUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type Page = "home" | "insights";

interface NavigationProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  return (
    <div className="sticky top-0 z-50 bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950 border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-4">
        <Tabs value={currentPage} onValueChange={(value) => onPageChange(value as Page)}>
          <TabsList className="grid w-full grid-cols-2 bg-white/50 dark:bg-slate-800/50">
            <TabsTrigger
              value="home"
              className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
