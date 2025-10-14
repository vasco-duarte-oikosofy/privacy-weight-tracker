import { useRef } from "react";
import { Download, Upload, Database } from "lucide-react";
import { useWeightStore } from "@/hooks/use-weight-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

export function StateBackup() {
  const exportFullState = useWeightStore((state) => state.exportFullState);
  const importFullState = useWeightStore((state) => state.importFullState);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const stateJson = exportFullState();
      const blob = new Blob([stateJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = format(new Date(), "yyyy-MM-dd_HHmmss");
      link.href = url;
      link.download = `momentum-backup-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Backup exported successfully!");
    } catch (error) {
      toast.error("Failed to export backup");
      console.error(error);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const result = importFullState(jsonData);

        if (result.success) {
          toast.success("Backup restored successfully!");
          // Reload the page to reflect the imported data
          window.location.reload();
        } else {
          toast.error(result.error || "Failed to import backup");
        }
      } catch (error) {
        toast.error("Failed to read backup file");
        console.error(error);
      }
    };
    reader.readAsText(file);

    // Reset the input so the same file can be imported again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Backup & Restore
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Export or import your complete app data
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Your backup includes all weight entries, goals, and settings. Store it safely to restore your data later.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleExport}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Backup
          </Button>

          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Backup
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImport}
          className="hidden"
        />

        <p className="text-xs text-slate-500 dark:text-slate-400">
          <strong>Note:</strong> Importing a backup will replace all current data. Make sure to export your current data first if you want to keep it.
        </p>
      </div>
    </div>
  );
}
