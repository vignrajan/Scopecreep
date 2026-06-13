import { Badge } from "@/components/ui/badge";
import type { ChangeOrderStatus } from "@/types";

const MAP: Record<
  ChangeOrderStatus,
  { label: string; variant: "green" | "yellow" | "grey" | "red" }
> = {
  draft: { label: "Draft", variant: "grey" },
  sent: { label: "Sent", variant: "yellow" },
  signed: { label: "Signed", variant: "green" },
  declined: { label: "Declined", variant: "red" },
};

export function ChangeOrderStatusBadge({ status }: { status: ChangeOrderStatus }) {
  const { label, variant } = MAP[status];
  return <Badge variant={variant}>{label}</Badge>;
}
