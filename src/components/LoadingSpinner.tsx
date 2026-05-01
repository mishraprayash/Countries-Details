import { Loader2 } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-muted" />
      <p className="text-sm font-medium text-muted font-sora">
        Loading data...
      </p>
    </div>
  );
}
