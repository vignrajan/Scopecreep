import { Resend } from "resend";

let resend: Resend | null = null;
function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

const FROM = () => process.env.EMAIL_FROM ?? "ScopeLock <onboarding@resend.dev>";

/**
 * Thin wrapper so callers never crash the request path on an email failure.
 * Returns true on success, false (and logs) on failure.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  try {
    const { error } = await getResend().emails.send({
      from: FROM(),
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    if (error) {
      console.error("[email] send error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send threw:", err);
    return false;
  }
}

export * from "./templates";
