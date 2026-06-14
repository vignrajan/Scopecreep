import { formatCurrency } from "@/lib/utils";

const INDIGO = "#6366f1";

function shell(inner: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <tr><td style="background:${INDIGO};padding:20px 28px;">
          <span style="color:#fff;font-weight:700;font-size:18px;letter-spacing:-0.3px;">ScopeLock</span>
        </td></tr>
        <tr><td style="padding:28px;">${inner}</td></tr>
        <tr><td style="padding:0 28px 28px;color:#94a3b8;font-size:12px;line-height:1.6;">
          Sent by ScopeLock — scope creep &amp; change-order management for freelancers.
        </td></tr>
      </table>
    </td></tr>
  </table>
  </body></html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${INDIGO};color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:8px;font-size:15px;">${label}</a>`;
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;color:#64748b;font-size:14px;">${label}</td>
    <td style="padding:8px 0;text-align:right;font-size:14px;font-weight:600;">${value}</td>
  </tr>`;
}

/** 1. Change order sent to client → includes details + sign link. */
export function changeOrderSentEmail(opts: {
  projectName: string;
  freelancerName: string;
  number?: number | null;
  title: string;
  description: string;
  hours: number;
  rate: number;
  total: number;
  currency: string;
  signUrl: string;
}): { subject: string; html: string } {
  const label = opts.number ? `Change Order #${opts.number}` : "Change order";
  const inner = `
    <h1 style="margin:0 0 8px;font-size:20px;">${label} for ${opts.projectName}</h1>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;">
      ${opts.freelancerName} has prepared a change order covering work outside the original project scope.
    </p>
    <div style="border:1px solid #e2e8f0;border-radius:10px;padding:18px 20px;margin-bottom:24px;">
      <div style="font-weight:700;font-size:16px;margin-bottom:6px;">${opts.title}</div>
      <p style="margin:0 0 14px;color:#475569;font-size:14px;line-height:1.6;">${opts.description}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${detailRow("Estimated hours", String(opts.hours))}
        ${detailRow("Rate", `${formatCurrency(opts.rate, opts.currency)} / hr`)}
        ${detailRow("Total", `<span style="color:${INDIGO};font-size:16px;">${formatCurrency(opts.total, opts.currency)}</span>`)}
      </table>
    </div>
    <div style="text-align:center;">${button(opts.signUrl, "Review and Sign")}</div>`;
  return { subject: `${label} for ${opts.projectName} — review & sign`, html: shell(inner) };
}

/** 2. Client signed → notify freelancer. */
export function clientSignedEmail(opts: {
  projectName: string;
  clientName: string;
  title: string;
  total: number;
  currency: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const inner = `
    <h1 style="margin:0 0 8px;font-size:20px;">✅ Change order signed</h1>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;">
      ${opts.clientName || "Your client"} approved “${opts.title}” on <strong>${opts.projectName}</strong>
      for <strong>${formatCurrency(opts.total, opts.currency)}</strong>.
    </p>
    <div style="text-align:center;">${button(opts.dashboardUrl, "View in dashboard")}</div>`;
  return { subject: `Signed: ${opts.title} (${opts.projectName})`, html: shell(inner) };
}

/** 3. Client declined → notify freelancer. */
export function clientDeclinedEmail(opts: {
  projectName: string;
  clientName: string;
  clientEmail: string | null;
  title: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const inner = `
    <h1 style="margin:0 0 8px;font-size:20px;">Change order declined</h1>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;">
      ${opts.clientName || "Your client"} declined “${opts.title}” on <strong>${opts.projectName}</strong>.
      ${opts.clientEmail ? `You can follow up at <a href="mailto:${opts.clientEmail}">${opts.clientEmail}</a>.` : ""}
    </p>
    <div style="text-align:center;">${button(opts.dashboardUrl, "View in dashboard")}</div>`;
  return { subject: `Declined: ${opts.title} (${opts.projectName})`, html: shell(inner) };
}

/** 4. Weekly summary → Monday 9am. */
export function weeklySummaryEmail(opts: {
  fullName: string;
  activeProjects: number;
  extrasThisWeek: number;
  currency: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const inner = `
    <h1 style="margin:0 0 8px;font-size:20px;">Your week on ScopeLock</h1>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;">
      Hi ${opts.fullName || "there"}, here's your weekly recap.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;padding:8px 18px;margin-bottom:24px;">
      ${detailRow("Active projects", String(opts.activeProjects))}
      ${detailRow("Extras approved this week", formatCurrency(opts.extrasThisWeek, opts.currency))}
    </table>
    <div style="text-align:center;">${button(opts.dashboardUrl, "Open dashboard")}</div>`;
  return { subject: "Your weekly ScopeLock summary", html: shell(inner) };
}
