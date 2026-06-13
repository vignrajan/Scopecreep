import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ScopeEditor({
  defaultValue,
  name = "original_scope",
}: {
  defaultValue?: string;
  name?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>Original scope</Label>
      <Textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        required
        rows={7}
        placeholder="Describe exactly what was agreed: deliverables, pages, revisions, timeline… This is the baseline ScopeLock compares new requests against."
      />
      <p className="text-xs text-muted-foreground">
        Be specific — the AI uses this as the source of truth for what&apos;s in scope.
      </p>
    </div>
  );
}
