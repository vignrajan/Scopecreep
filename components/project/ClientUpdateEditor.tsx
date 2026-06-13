"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateClientUpdate } from "@/app/actions/project";

export function ClientUpdateEditor({
  projectId,
  initial,
}: {
  projectId: string;
  initial: string | null;
}) {
  const [value, setValue] = useState(initial ?? "");
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const res = await updateClientUpdate(projectId, value);
      if (res.error) toast.error(res.error);
      else toast.success("Client update saved");
    });
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="client_update">Latest update for client (optional)</Label>
      <Textarea
        id="client_update"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        placeholder="Shown on the public client page — e.g. 'Homepage shipped, working on the blog this week.'"
      />
      <Button size="sm" onClick={save} disabled={pending}>
        {pending ? "Saving…" : "Save update"}
      </Button>
    </div>
  );
}
