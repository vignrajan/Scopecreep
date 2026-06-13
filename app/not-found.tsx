import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-secondary/40 px-4 text-center">
      <div className="text-5xl font-extrabold text-primary">404</div>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Button asChild className="mt-6 cursor-pointer">
        <Link href="/">Back to home</Link>
      </Button>
    </main>
  );
}
