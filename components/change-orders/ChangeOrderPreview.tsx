import { formatCurrency } from "@/lib/utils";

/** Read-only, presentational change-order view. Shared by the preview dialog
 *  and the public client signing page. */
export function ChangeOrderPreview({
  projectName,
  freelancerName,
  number,
  title,
  description,
  hours,
  rate,
  total,
  currency,
}: {
  projectName: string;
  freelancerName?: string;
  number?: number | null;
  title: string;
  description: string;
  hours: number;
  rate: number;
  total: number;
  currency: string;
}) {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          {number ? `Change order #${number}` : "Change order"} · {projectName}
        </div>
        <h2 className="mt-1 text-xl font-semibold">{title}</h2>
        {freelancerName && (
          <p className="text-sm text-muted-foreground">Prepared by {freelancerName}</p>
        )}
      </div>

      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
        {description}
      </p>

      <div className="rounded-lg border">
        <Row label="Estimated hours" value={String(hours)} />
        <Row label="Rate" value={`${formatCurrency(rate, currency)} / hr`} />
        <Row label="Total" value={formatCurrency(total, currency)} emphasize />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={emphasize ? "text-lg font-bold text-primary" : "text-sm font-medium"}>
        {value}
      </span>
    </div>
  );
}
