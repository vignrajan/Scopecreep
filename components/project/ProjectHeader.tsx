import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { ProjectSettings } from "@/components/project/ProjectSettings";
import { cn, appUrl } from "@/lib/utils";
import type { Project } from "@/types";
import { ArrowLeft } from "lucide-react";

const TABS = [
  { key: "overview", label: "Overview", suffix: "" },
  { key: "requests", label: "Requests", suffix: "/requests" },
  { key: "change-orders", label: "Change orders", suffix: "/change-orders" },
] as const;

export function ProjectHeader({
  project,
  active,
}: {
  project: Project;
  active: "overview" | "requests" | "change-orders";
}) {
  return (
    <div className="space-y-4">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All projects
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            <Badge variant={project.status === "active" ? "green" : "grey"}>
              {project.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {project.client_name || "No client name"}
            {project.client_email ? ` · ${project.client_email}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ProjectSettings project={project} />
          <CopyButton value={appUrl(`/client/${project.public_token}`)} label="Share client link" />
        </div>
      </div>

      <nav className="flex gap-1 border-b">
        {TABS.map((t) => {
          const isActive = t.key === active;
          return (
            <Link
              key={t.key}
              href={`/project/${project.id}${t.suffix}`}
              className={cn(
                "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
