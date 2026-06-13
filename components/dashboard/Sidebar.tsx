"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Settings, CreditCard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/login/actions";

const NAV = [
  { href: "/dashboard", label: "Projects", icon: LayoutGrid, match: (p: string) => p === "/dashboard" || p.startsWith("/project") },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, match: (p: string) => p === "/dashboard/settings" },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard, match: (p: string) => p === "/dashboard/billing" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-row gap-1 border-b bg-card p-3 md:h-screen md:w-60 md:flex-col md:border-b-0 md:border-r md:p-4">
      <div className="mb-0 hidden px-2 py-3 md:mb-4 md:block">
        <Link href="/dashboard" className="text-lg font-bold tracking-tight text-primary">
          ScopeLock
        </Link>
      </div>
      <nav className="flex flex-1 flex-row gap-1 md:flex-col">
        {NAV.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <form action={signOut} className="md:mt-auto">
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">Sign out</span>
        </button>
      </form>
    </aside>
  );
}
