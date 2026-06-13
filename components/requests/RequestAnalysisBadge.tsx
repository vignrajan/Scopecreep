import { Badge } from "@/components/ui/badge";
import type { AiVerdict } from "@/types";

const MAP: Record<AiVerdict, { label: string; variant: "green" | "red" | "yellow" }> = {
  in_scope: { label: "In scope", variant: "green" },
  out_of_scope: { label: "Out of scope", variant: "red" },
  ambiguous: { label: "Ambiguous", variant: "yellow" },
};

export function RequestAnalysisBadge({ verdict }: { verdict: AiVerdict | null }) {
  if (!verdict) return <Badge variant="grey">Not analyzed</Badge>;
  const { label, variant } = MAP[verdict];
  return <Badge variant={variant}>{label}</Badge>;
}
