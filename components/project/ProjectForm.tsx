"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScopeEditor } from "./ScopeEditor";
import { createProject } from "@/app/actions/project";

export function ProjectForm({
  onCreated,
  submitLabel = "Create project",
}: {
  /** Called with the new project id + public token after success. */
  onCreated?: (result: { id: string; token: string }) => void;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createProject(formData);
      if (res.error) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      toast.success("Project created");
      if (onCreated && res.id && res.token) {
        onCreated({ id: res.id, token: res.token });
      } else if (res.id) {
        router.push(`/project/${res.id}`);
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Project name</Label>
        <Input id="name" name="name" required placeholder="Acme website redesign" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client_name">Client name</Label>
          <Input id="client_name" name="client_name" placeholder="Acme Inc." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client_email">Client email</Label>
          <Input
            id="client_email"
            name="client_email"
            type="email"
            placeholder="client@acme.com"
          />
        </div>
      </div>
      <ScopeEditor />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating…" : submitLabel}
      </Button>
    </form>
  );
}
