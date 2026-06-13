import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="max-w-lg space-y-6">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-44 w-full" />
    </div>
  );
}
