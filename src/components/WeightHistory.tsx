import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { Trash2, History, Weight } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWeightStore, WeightEntry } from "@/hooks/use-weight-store";
import { WeightImportDialog } from './WeightImportDialog';
function HistoryItem({ entry }: { entry: WeightEntry }) {
  const removeEntry = useWeightStore((state) => state.removeEntry);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex items-center justify-between py-3"
    >
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <Weight className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        </div>
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-200">
            {entry.weight.toFixed(1)} kg
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {format(new Date(entry.date), 'MMMM d, yyyy')}
          </p>
        </div>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-500">
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this weight entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => removeEntry(entry.id)} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
export function WeightHistory() {
  const entries = useWeightStore((state) => state.entries);
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return (
    <Card className="w-full animate-fade-in" style={{ animationDelay: '300ms' }}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-slate-800 dark:text-slate-200">
          <History className="h-6 w-6 text-slate-500" />
          History
        </CardTitle>
        <WeightImportDialog />
      </CardHeader>
      <CardContent>
        {sortedEntries.length > 0 ? (
          <div className="flow-root">
            <div className="-my-3 divide-y divide-slate-200 dark:divide-slate-800">
              <AnimatePresence>
                {sortedEntries.map((entry) => (
                  <HistoryItem key={entry.id} entry={entry} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">
            No entries yet. Log your weight to get started!
          </p>
        )}
      </CardContent>
    </Card>
  );
}