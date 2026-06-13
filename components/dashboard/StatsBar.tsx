import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { FolderKanban, Clock, DollarSign } from "lucide-react";

export function StatsBar({
  activeProjects,
  totalExtraHours,
  totalExtraRevenue,
  currency,
}: {
  activeProjects: number;
  totalExtraHours: number;
  totalExtraRevenue: number;
  currency: string;
}) {
  const stats = [
    { label: "Active projects", value: String(activeProjects), icon: FolderKanban },
    { label: "Extra hours approved", value: String(totalExtraHours), icon: Clock },
    {
      label: "Extra revenue approved",
      value: formatCurrency(totalExtraRevenue, currency),
      icon: DollarSign,
    },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-semibold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
