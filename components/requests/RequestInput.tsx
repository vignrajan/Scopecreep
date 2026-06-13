"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { createScopeRequest } from "@/app/actions/project";

export function RequestInput({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    const trimmed = content.trim();
    if (!trimmed) {
      toast.error("Paste what your client asked for.");
      return;
    }
    startTransition(async () => {
      // 1. Persist the request (pending).
      const created = await createScopeRequest(projectId, trimmed);
      if (created.error || !created.id) {
        toast.error(created.error ?? "Could not log request.");
        return;
      }

      // 2. Kick off AI analysis.
      try {
        const res = await fetch("/api/ai/analyze-request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId: created.id }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success("Analyzed");
        } else if (res.status === 429) {
          toast.error(data.error ?? "Rate limit reached.");
        } else if (data.fallback) {
          toast.warning("AI unavailable — classify this one manually below.");
        } else {
          toast.error(data.error ?? "Analysis failed.");
        }
      } catch {
        toast.warning("AI unavailable — classify this one manually below.");
      }

      setContent("");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="Paste what your client asked for… e.g. 'Can you also add a booking calendar and SMS reminders?'"
        />
        <div className="flex justify-end">
          <Button onClick={submit} disabled={pending}>
            <Sparkles className="h-4 w-4" />
            {pending ? "Analyzing…" : "Analyze request"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
