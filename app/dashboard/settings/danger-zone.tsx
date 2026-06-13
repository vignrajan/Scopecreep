"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteAccount } from "@/app/actions/settings";

export function DangerZone() {
  const [confirm, setConfirm] = useState("");
  const [pending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      const res = await deleteAccount();
      // On success this redirects; only an error returns.
      if (res?.error) toast.error(res.error);
    });
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">Delete account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Permanently deletes your account and all projects, requests, and change orders. This
          cannot be undone. Type <span className="font-semibold">DELETE</span> to confirm.
        </p>
        <Input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="DELETE"
          className="max-w-xs"
        />
        <Button
          variant="destructive"
          className="cursor-pointer"
          disabled={pending || confirm !== "DELETE"}
          onClick={remove}
        >
          <Trash2 className="h-4 w-4" /> {pending ? "Deleting…" : "Delete my account"}
        </Button>
      </CardContent>
    </Card>
  );
}
