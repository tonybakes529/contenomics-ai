"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard/viewtrack", label: "Dashboard", exact: true },
  { href: "/dashboard/viewtrack/identity", label: "Identity" },
  { href: "/dashboard/viewtrack/creative", label: "Creative" },
  { href: "/dashboard/viewtrack/performance", label: "Performance" },
  { href: "/dashboard/viewtrack/conversion", label: "Conversion" },
  { href: "/dashboard/viewtrack/ai-export", label: "AI Export" },
];

export function ViewtrackTabNav() {
  const pathname = usePathname();
  return (
    <nav className="border-border -mx-6 mb-6 flex gap-1 overflow-x-auto border-b px-6">
      {TABS.map((tab) => {
        const active = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            {active ? (
              <span className="bg-foreground absolute inset-x-3 -bottom-px h-0.5 rounded-full" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
