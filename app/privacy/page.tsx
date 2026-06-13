import Link from "next/link";

export const metadata = { title: "Privacy Policy — ScopeLock" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 md:px-8">
      <Link href="/" className="text-sm font-medium text-primary">← Back home</Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: June 2026</p>

      <div className="prose prose-sm mt-8 max-w-none space-y-6 text-foreground/90">
        <section>
          <h2 className="text-lg font-semibold">What we collect</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Account data (name, email), the project and scope information you enter, client names
            and emails you provide, and billing identifiers from our payment processor. We process
            the text of scope requests with our AI provider solely to classify them.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">How we use it</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            To provide the service: analyzing requests, generating and sending change orders,
            processing subscriptions, and sending transactional and summary emails. We do not sell
            your data.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">Subprocessors</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We rely on Supabase (database/auth), Anthropic (AI analysis), Lemon Squeezy (payments,
            as Merchant of Record), Resend (email), and Vercel (hosting). Each processes data only
            as needed to deliver their part of the service.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">Your rights</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            You can edit your data in-app and permanently delete your account and all associated
            data from Settings. For other requests, contact us.
          </p>
        </section>
        <p className="rounded-md bg-secondary/60 p-3 text-xs text-muted-foreground">
          This template is a starting point and not legal advice. Have it reviewed by counsel and
          add your contact details and jurisdiction before launch.
        </p>
      </div>
    </main>
  );
}
