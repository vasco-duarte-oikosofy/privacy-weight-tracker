import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useWeightStore, WeightUnit } from '@/hooks/use-weight-store';
const importSchema = z.object({
  csvData: z.string().min(1, 'Please paste your CSV data.'),
  unit: z.enum(['kg', 'lbs']),
});
type ImportFormValues = z.infer<typeof importSchema>;
export function WeightImportDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const importEntries = useWeightStore((state) => state.importEntries);
  const form = useForm<ImportFormValues>({
    resolver: zodResolver(importSchema),
    defaultValues: {
      csvData: '',
      unit: 'kg',
    },
  });
  function onSubmit(values: ImportFormValues) {
    try {
      const { importedCount, errorCount } = importEntries(values.csvData, values.unit);
      if (importedCount > 0) {
        toast.success(`${importedCount} entries imported successfully!`, {
          description: errorCount > 0 ? `${errorCount} rows had errors and were skipped.` : 'Your history has been updated.',
        });
      } else if (errorCount > 0) {
        toast.error('Import failed', {
          description: `Could not import any entries. Please check the format. ${errorCount} rows had errors.`,
        });
      } else {
        toast.info('No new entries to import.');
      }
      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to import weight entries:', error);
      toast.error('Something went wrong', {
        description: 'Could not import your data. Please try again.',
      });
    }
  }
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Import Weight History
          </DialogTitle>
          <DialogDescription>
            Paste your data from a CSV file. Each line should be in the format:
            <code className="block bg-slate-100 dark:bg-slate-800 p-2 rounded-md text-sm my-2 font-mono">
              YYYY-MM-DD,Weight
            </code>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="csvData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CSV Data</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g.,&#10;2023-01-15,80.5&#10;2023-01-16,80.2"
                      className="min-h-[120px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit for Imported Weights</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      value={field.value}
                      onValueChange={(value: WeightUnit) => {
                        if (value) field.onChange(value);
                      }}
                    >
                      <ToggleGroupItem value="kg">kg</ToggleGroupItem>
                      <ToggleGroupItem value="lbs">lbs</ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={form.formState.isSubmitting}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import Data
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}