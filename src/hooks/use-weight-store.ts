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
interface WeightState {
  entries: WeightEntry[];
  addEntry: (weight: number, unit: WeightUnit, date: Date) => void;
  removeEntry: (id: string) => void;
  importEntries: (csvData: string, unit: WeightUnit) => { importedCount: number; errorCount: number };
}
export const useWeightStore = create<WeightState>()(
  persist(
    (set) => ({
      entries: [],
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
    }),
    {
      name: 'momentum-weight-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);