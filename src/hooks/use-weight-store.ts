import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { format, parse, isValid } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { LBS_TO_KG_CONVERSION_FACTOR } from '@/lib/constants';

export type WeightUnit = 'kg' | 'lbs';

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  weight: number; // Always in KG
}

export interface GoalSettings {
  targetWeight?: number;      // Target weight in kg
  targetDate?: string;         // Optional target date (YYYY-MM-DD)
  startWeight?: number;        // Weight when goal was set (kg)
  startDate?: string;          // Date when goal was set (YYYY-MM-DD)
}

export interface AppState {
  entries: WeightEntry[];
  goal: GoalSettings | null;
  exportedAt?: string;
  version?: string;
}

interface WeightState {
  entries: WeightEntry[];
  goal: GoalSettings | null;
  addEntry: (weight: number, unit: WeightUnit, date: Date) => void;
  removeEntry: (id: string) => void;
  importEntries: (csvData: string, unit: WeightUnit) => { importedCount: number; errorCount: number };
  setGoal: (targetWeight: number, targetDate?: string) => void;
  clearGoal: () => void;
  exportFullState: () => string;
  importFullState: (jsonData: string) => { success: boolean; error?: string };
}
export const useWeightStore = create<WeightState>()(
  persist(
    (set, get) => ({
      entries: [],
      goal: null,
      addEntry: (weight, unit, date) => {
        const dateString = format(date, 'yyyy-MM-dd');
        const weightInKg = unit === 'lbs' ? weight * LBS_TO_KG_CONVERSION_FACTOR : weight;
        set((state) => {
          const existingEntryIndex = state.entries.findIndex(
            (entry) => entry.date === dateString
          );
          let newEntries = [...state.entries];
          if (existingEntryIndex > -1) {
            // Update existing entry for the day
            newEntries[existingEntryIndex] = {
              ...newEntries[existingEntryIndex],
              weight: weightInKg,
            };
          } else {
            // Add a new entry
            const newEntry: WeightEntry = {
              id: uuidv4(),
              date: dateString,
              weight: weightInKg,
            };
            newEntries.push(newEntry);
          }
          // Sort entries by date ascending
          newEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          return { entries: newEntries };
        });
      },
      removeEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        })),
      importEntries: (csvData, unit) => {
        let importedCount = 0;
        let errorCount = 0;
        const newEntriesMap = new Map<string, number>();
        const rows = csvData.split('\n');
        rows.forEach(row => {
          const [dateStr, weightStr] = row.split(',').map(s => s.trim());
          if (!dateStr || !weightStr) return;
          const date = parse(dateStr, 'yyyy-MM-dd', new Date());
          const weight = parseFloat(weightStr);
          if (isValid(date) && !isNaN(weight) && weight > 0) {
            const dateString = format(date, 'yyyy-MM-dd');
            const weightInKg = unit === 'lbs' ? weight * LBS_TO_KG_CONVERSION_FACTOR : weight;
            newEntriesMap.set(dateString, weightInKg);
          } else {
            errorCount++;
          }
        });
        if (newEntriesMap.size > 0) {
          set(state => {
            const entriesMap = new Map(state.entries.map(e => [e.date, e]));
            newEntriesMap.forEach((weight, date) => {
              const existingEntry = entriesMap.get(date);
              if (existingEntry) {
                existingEntry.weight = weight;
              } else {
                entriesMap.set(date, { id: uuidv4(), date, weight });
              }
              importedCount++;
            });
            const updatedEntries = Array.from(entriesMap.values());
            updatedEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            return { entries: updatedEntries };
          });
        }
        return { importedCount, errorCount };
      },
      setGoal: (targetWeight, targetDate) => {
        const state = get();
        const latestEntry = state.entries.length > 0 ? state.entries[state.entries.length - 1] : null;

        set({
          goal: {
            targetWeight,
            targetDate,
            startWeight: latestEntry?.weight,
            startDate: latestEntry?.date,
          }
        });
      },
      clearGoal: () => set({ goal: null }),
      exportFullState: () => {
        const state = get();
        const exportData: AppState = {
          entries: state.entries,
          goal: state.goal,
          exportedAt: new Date().toISOString(),
          version: '1.0',
        };
        return JSON.stringify(exportData, null, 2);
      },
      importFullState: (jsonData: string) => {
        try {
          const importedData: AppState = JSON.parse(jsonData);

          // Validate the data structure
          if (!importedData || typeof importedData !== 'object') {
            return { success: false, error: 'Invalid data format' };
          }

          if (!Array.isArray(importedData.entries)) {
            return { success: false, error: 'Invalid entries data' };
          }

          // Validate entries
          for (const entry of importedData.entries) {
            if (!entry.id || !entry.date || typeof entry.weight !== 'number') {
              return { success: false, error: 'Invalid entry format' };
            }
          }

          // Validate goal if present
          if (importedData.goal !== null && importedData.goal !== undefined) {
            if (typeof importedData.goal !== 'object' || typeof importedData.goal.targetWeight !== 'number') {
              return { success: false, error: 'Invalid goal format' };
            }
          }

          // Import the data
          set({
            entries: importedData.entries,
            goal: importedData.goal,
          });

          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to parse JSON'
          };
        }
      },
    }),
    {
      name: 'momentum-weight-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);