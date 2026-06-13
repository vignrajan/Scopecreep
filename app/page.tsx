import Link from "next/link";
import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Sparkles, FileSignature } from "lucide-react";

export default async function HomePage() {
  const user = await getOptionalUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <span className="text-lg font-bold tracking-tight text-primary">ScopeLock</span>
        <Button asChild variant="ghost">
          <Link href="/login">Sign in</Link>
        </Button>
      </header>

      <section className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> AI-powered scope analysis
        </span>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Stop eating scope creep.
          <br />
          Turn extra requests into <span className="text-primary">signed change orders.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          Paste what your client asked for. ScopeLock tells you if it&apos;s in scope, estimates
          the extra hours, and generates a change order your client can sign in one click.
        </p>
        <div className="mt-8 flex gap-3">
          <Button asChild size="lg">
            <Link href="/login">Get started free</Link>
          </Button>
        </div>

        <div className="mt-16 grid w-full gap-6 sm:grid-cols-3">
          {[
            { icon: Sparkles, title: "AI verdict", body: "In-scope, out-of-scope, or ambiguous — with reasoning." },
            { icon: FileSignature, title: "Change orders", body: "Pre-filled from the estimate, sent for e-sign." },
            { icon: ShieldCheck, title: "Transparency log", body: "A clean client page of approved extras." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-5 text-left">
              <f.icon className="mb-3 h-5 w-5 text-primary" />
              <div className="font-semibold">{f.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
