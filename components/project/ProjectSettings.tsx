"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateProject, deleteProject, setProjectStatus } from "@/app/actions/project";
import type { Project } from "@/types";

export function ProjectSettings({ project }: { project: Project }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  function save(formData: FormData) {
    startTransition(async () => {
      const res = await updateProject(project.id, formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Project updated");
        setOpen(false);
        router.refresh();
      }
    });
  }

  function changeStatus(status: "active" | "completed" | "archived") {
    startTransition(async () => {
      const res = await setProjectStatus(project.id, status);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Status updated");
        router.refresh();
      }
    });
  }

  function remove() {
    startTransition(async () => {
      const res = await deleteProject(project.id);
      // deleteProject redirects on success; only an error returns here.
      if (res?.error) toast.error(res.error);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="cursor-pointer">
          <Settings2 className="h-4 w-4" /> Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Project settings</DialogTitle>
        </DialogHeader>

        <form action={save} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ps-name">Project name</Label>
            <Input id="ps-name" name="name" defaultValue={project.name} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ps-client">Client name</Label>
              <Input id="ps-client" name="client_name" defaultValue={project.client_name ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ps-email">Client email</Label>
              <Input
                id="ps-email"
                name="client_email"
                type="email"
                defaultValue={project.client_email ?? ""}
                placeholder="client@acme.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ps-scope">Original scope</Label>
            <Textarea id="ps-scope" name="original_scope" rows={6} defaultValue={project.original_scope} required />
          </div>
          <Button type="submit" className="w-full cursor-pointer" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </form>

        <div className="space-y-2 border-t pt-4">
          <Label>Status</Label>
          <div className="flex gap-2">
            {(["active", "completed", "archived"] as const).map((s) => (
              <Button
                key={s}
                type="button"
                size="sm"
                variant={project.status === s ? "default" : "outline"}
                className="cursor-pointer capitalize"
                disabled={pending}
                onClick={() => changeStatus(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <div className="text-sm font-semibold text-destructive">Danger zone</div>
          <p className="text-xs text-muted-foreground">
            Deleting a project permanently removes its requests and change orders.
          </p>
          {confirmDelete ? (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="cursor-pointer"
                disabled={pending}
                onClick={remove}
              >
                <Trash2 className="h-4 w-4" /> {pending ? "Deleting…" : "Confirm delete"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4" /> Delete project
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
