import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Weight, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWeightStore, WeightUnit } from "@/hooks/use-weight-store";
import { ENCOURAGING_PHRASES } from "@/lib/constants";
const formSchema = z.object({
  weight: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string({ required_error: "Please enter your weight." })
      .transform((val) => parseFloat(val))
      .refine((num) => !isNaN(num), { message: "Please enter a valid number." })
      .refine((num) => num > 0, { message: "Weight must be a positive number." })
  ),
  unit: z.enum(["kg", "lbs"]),
});
type FormValues = z.infer<typeof formSchema>;
export function WeightForm() {
  const addEntry = useWeightStore((state) => state.addEntry);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: undefined,
      unit: "kg",
    },
  });
  function onSubmit(values: FormValues) {
    try {
      addEntry(values.weight, values.unit, new Date());
      const randomPhrase = ENCOURAGING_PHRASES[Math.floor(Math.random() * ENCOURAGING_PHRASES.length)];
      toast.success("Weight logged!", {
        description: randomPhrase,
      });
      form.reset({ weight: undefined, unit: values.unit });
    } catch (error) {
      console.error("Failed to add weight entry:", error);
      toast.error("Something went wrong", {
        description: "Could not save your weight. Please try again.",
      });
    }
  }
  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-slate-800 dark:text-slate-200">
          <Weight className="h-6 w-6 text-slate-500" />
          What's your weight today?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Weight</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 75.5"
                        {...field}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value)}
                        step="0.1"
                        className="text-base"
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
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <ToggleGroup
                        type="single"
                        variant="outline"
                        value={field.value}
                        onValueChange={(value: WeightUnit) => {
                          if (value) field.onChange(value);
                        }}
                        className="w-full sm:w-auto"
                      >
                        <ToggleGroupItem value="kg" className="w-full sm:w-auto">kg</ToggleGroupItem>
                        <ToggleGroupItem value="lbs" className="w-full sm:w-auto">lbs</ToggleGroupItem>
                      </ToggleGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-slate-800 text-slate-50 hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300 transition-colors duration-200 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              disabled={form.formState.isSubmitting}
            >
              <Scale className="mr-2 h-4 w-4" /> Log Weight
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}