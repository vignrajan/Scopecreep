import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { formatCurrency, appUrl } from "@/lib/utils";
import type { Project } from "@/types";
import { ArrowRight } from "lucide-react";

const STATUS_VARIANT = {
  active: "green",
  completed: "grey",
  archived: "grey",
} as const;

export function ProjectCard({ project, currency }: { project: Project; currency: string }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/project/${project.id}`} className="group flex items-center gap-1">
              <h3 className="truncate font-semibold group-hover:text-primary">{project.name}</h3>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
            <p className="truncate text-sm text-muted-foreground">
              {project.client_name || "No client name"}
            </p>
          </div>
          <Badge variant={STATUS_VARIANT[project.status]}>{project.status}</Badge>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Extras approved</div>
            <div className="font-semibold text-primary">
              {formatCurrency(project.total_approved_extras, currency)}
            </div>
          </div>
          <CopyButton value={appUrl(`/client/${project.public_token}`)} label="Share" />
        </div>
      </CardContent>
    </Card>
  );
}
