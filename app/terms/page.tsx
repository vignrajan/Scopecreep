import Link from "next/link";

export const metadata = { title: "Terms of Service — ScopeLock" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 md:px-8">
      <Link href="/" className="text-sm font-medium text-primary">← Back home</Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: June 2026</p>

      <div className="mt-8 space-y-6">
        {[
          {
            h: "The service",
            p: "ScopeLock helps freelancers analyze client requests and generate change orders. AI verdicts are suggestions to assist your judgment, not legal or financial advice; you are responsible for what you send to clients.",
          },
          {
            h: "Accounts",
            p: "You're responsible for activity under your account and for the accuracy of the scope, client, and billing information you enter. Keep your credentials secure.",
          },
          {
            h: "Change orders & e-signatures",
            p: "ScopeLock records client approvals (timestamp and IP) for your convenience. The enforceability of any agreement between you and your client is your responsibility.",
          },
          {
            h: "Billing",
            p: "Paid plans are billed through Lemon Squeezy, our Merchant of Record. You can manage or cancel your subscription at any time; downgrades keep existing projects readable while locking new creation on the Free plan.",
          },
          {
            h: "Acceptable use",
            p: "Don't use ScopeLock for unlawful purposes, to send spam, or to abuse the AI or email systems. We may suspend accounts that do.",
          },
          {
            h: "Liability",
            p: "The service is provided “as is.” To the maximum extent permitted by law, we are not liable for indirect or consequential damages or for disputes between you and your clients.",
          },
        ].map((s) => (
          <section key={s.h}>
            <h2 className="text-lg font-semibold">{s.h}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{s.p}</p>
          </section>
        ))}
        <p className="rounded-md bg-secondary/60 p-3 text-xs text-muted-foreground">
          This template is a starting point and not legal advice. Have it reviewed by counsel and
          add your governing law, contact, and refund terms before launch.
        </p>
      </div>
    </main>
  );
}
