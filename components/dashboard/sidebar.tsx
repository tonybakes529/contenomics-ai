"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  ListChecks,
  Settings,
  ExternalLink,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  // Lucide icons in v1.x are exported as plain components.
  icon: React.ComponentType<{ className?: string; size?: number | string }>;
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/pages", label: "Pages", icon: FileText },
  { href: "/dashboard/subscribers", label: "Subscribers", icon: Users },
  { href: "/dashboard/lists", label: "Lists", icon: ListChecks },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar({
  username,
  email,
}: {
  username: string | null;
  email: string;
}) {
  const pathname = usePathname();
  return (
    <aside className="border-border bg-background hidden w-60 shrink-0 flex-col border-r p-4 md:flex">
      <Link
        href="/dashboard"
        className="mb-6 px-2 text-base font-semibold tracking-tight"
      >
        Contenomics
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "hover:bg-muted flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                active
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-border mt-4 space-y-2 border-t pt-4">
        {username ? (
          <Link
            href={`/${username}`}
            target="_blank"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-2.5 text-xs"
          >
            View public page <ExternalLink className="size-3" />
          </Link>
        ) : null}
        <div className="px-2.5 text-xs">
          <p className="text-foreground truncate font-medium">
            {username ? `@${username}` : email}
          </p>
          {username ? (
            <p className="text-muted-foreground truncate">{email}</p>
          ) : null}
        </div>
        <form action="/logout" method="get" className="px-2.5">
          <button
            type="submit"
            className="text-muted-foreground hover:text-foreground text-xs underline"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
