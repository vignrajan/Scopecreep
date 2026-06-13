"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProjectForm } from "@/components/project/ProjectForm";

export function NewProjectButton({
  canCreate,
}: {
  canCreate: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (!canCreate) {
    return (
      <Button asChild variant="outline">
        <Link href="/dashboard/billing">Upgrade to add projects</Link>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> New project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
        </DialogHeader>
        <ProjectForm />
      </DialogContent>
    </Dialog>
  );
}
