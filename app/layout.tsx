import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ScopeLock — Stop scope creep. Get paid for every extra request.",
  description:
    "ScopeLock uses AI to flag out-of-scope client requests and turns them into signed change orders in seconds. The fastest way for freelancers to protect their margins.",
  openGraph: {
    title: "ScopeLock — Stop scope creep. Get paid for every extra request.",
    description:
      "AI flags out-of-scope client requests and turns them into signed change orders in seconds.",
    url: SITE_URL,
    siteName: "ScopeLock",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScopeLock — Stop scope creep.",
    description:
      "AI flags out-of-scope client requests and turns them into signed change orders in seconds.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${jakarta.className} min-h-screen antialiased`}>
        <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
