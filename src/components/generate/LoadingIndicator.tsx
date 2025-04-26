import { Loader2 } from "lucide-react";

export function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center space-x-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Ładowanie...</span>
    </div>
  );
}
