import { Loader2 } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-navy-500 dark:text-navy-400" />
      <p className="text-sm font-medium text-navy-500 dark:text-navy-400">
        Loading data...
      </p>
    </div>
  );
}
