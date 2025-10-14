import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parse, isValid, isBefore, startOfToday } from "date-fns";
import { Target, Edit2, Trash2 } from "lucide-react";
import { useWeightStore, type WeightUnit } from "@/hooks/use-weight-store";
import { LBS_TO_KG_CONVERSION_FACTOR } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const goalSchema = z.object({
  targetWeight: z
    .string()
    .min(1, "Weight is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Weight must be a positive number",
    }),
  targetDate: z.string().optional(),
  unit: z.enum(["kg", "lbs"]),
});

type GoalFormData = z.infer<typeof goalSchema>;

export function GoalSettingsCard() {
  const goal = useWeightStore((state) => state.goal);
  const setGoal = useWeightStore((state) => state.setGoal);
  const clearGoal = useWeightStore((state) => state.clearGoal);
  const [isEditing, setIsEditing] = useState(!goal);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      targetWeight: goal?.targetWeight?.toString() || "",
      targetDate: goal?.targetDate || "",
      unit: "kg",
    },
  });

  const unit = watch("unit");

  const onSubmit = (data: GoalFormData) => {
    // Convert weight to kg if in lbs
    const weightInKg =
      data.unit === "lbs"
        ? parseFloat(data.targetWeight) * LBS_TO_KG_CONVERSION_FACTOR
        : parseFloat(data.targetWeight);

    // Validate date if provided
    if (data.targetDate) {
      const targetDate = parse(data.targetDate, "yyyy-MM-dd", new Date());
      if (!isValid(targetDate)) {
        toast.error("Invalid date format");
        return;
      }
      if (isBefore(targetDate, startOfToday())) {
        toast.error("Target date must be today or in the future");
        return;
      }
    }

    setGoal(weightInKg, data.targetDate || undefined);
    setIsEditing(false);
    toast.success("Goal set successfully!");
  };

  const handleClearGoal = () => {
    clearGoal();
    setIsEditing(true);
    toast.success("Goal cleared");
  };

  const displayWeight = (weightKg: number) => {
    if (unit === "lbs") {
      return (weightKg / LBS_TO_KG_CONVERSION_FACTOR).toFixed(1);
    }
    return weightKg.toFixed(1);
  };

  if (!isEditing && goal) {
    return (
      <div className="bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
              <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Your Goal
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Target: {displayWeight(goal.targetWeight!)} {unit}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearGoal}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {goal.targetDate && (
            <p className="text-slate-600 dark:text-slate-400">
              <span className="font-medium">Target date:</span>{" "}
              {format(parse(goal.targetDate, "yyyy-MM-dd", new Date()), "MMM dd, yyyy")}
            </p>
          )}
          {goal.startWeight && (
            <p className="text-slate-600 dark:text-slate-400">
              <span className="font-medium">Starting weight:</span>{" "}
              {displayWeight(goal.startWeight)} {unit}
            </p>
          )}
          {goal.startDate && (
            <p className="text-slate-600 dark:text-slate-400">
              <span className="font-medium">Started:</span>{" "}
              {format(parse(goal.startDate, "yyyy-MM-dd", new Date()), "MMM dd, yyyy")}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
          <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Set Your Goal
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Define your target weight to track progress
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="targetWeight">Target Weight</Label>
            <Input
              id="targetWeight"
              type="number"
              step="0.1"
              placeholder="70.0"
              {...register("targetWeight")}
              className={errors.targetWeight ? "border-red-500" : ""}
            />
            {errors.targetWeight && (
              <p className="text-sm text-red-500">{errors.targetWeight.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Select
              value={unit}
              onValueChange={(value) => setValue("unit", value as WeightUnit)}
            >
              <SelectTrigger id="unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">Kilograms (kg)</SelectItem>
                <SelectItem value="lbs">Pounds (lbs)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetDate">Target Date (Optional)</Label>
          <Input
            id="targetDate"
            type="date"
            {...register("targetDate")}
            className={errors.targetDate ? "border-red-500" : ""}
          />
          {errors.targetDate && (
            <p className="text-sm text-red-500">{errors.targetDate.message}</p>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          >
            Set Goal
          </Button>
          {goal && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
