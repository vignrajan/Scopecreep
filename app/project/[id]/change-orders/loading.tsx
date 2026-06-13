import { Skeleton } from "@/components/ui/skeleton";

export default function ChangeOrdersLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-72" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-40 w-full" />
      ))}
    </div>
  );
}
