import { Loader2 } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-zinc-500 dark:text-zinc-400" />
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Loading data...
      </p>
    </div>
  );
}
