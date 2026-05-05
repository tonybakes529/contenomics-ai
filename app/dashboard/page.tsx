import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, MousePointerClick, FileText } from "lucide-react";

export const metadata = {
  title: "Overview — Contenomics",
};

export const dynamic = "force-dynamic";

export default async function DashboardOverview({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const since = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [
    { count: subscriberCount },
    { count: clickCount },
    { count: pageCount },
    { data: profile },
    { data: defaultPage },
  ] = await Promise.all([
    supabase
      .from("subscribers")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", user.id)
      .neq("status", "unsubscribed"),
    supabase
      .from("clicks")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", user.id)
      .gte("created_at", since),
    supabase
      .from("pages")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", user.id),
    supabase
      .from("profiles")
      .select("username, display_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("pages")
      .select("id, slug, is_published")
      .eq("profile_id", user.id)
      .eq("is_default", true)
      .maybeSingle(),
  ]);

  return (
    <div className="space-y-8 px-4 py-8 md:px-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-muted-foreground text-sm">
          Welcome back{profile?.display_name ? `, ${profile.display_name}` : ""}.
        </p>
      </div>

      {searchParams.error ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border px-4 py-3 text-sm"
        >
          {searchParams.error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Users}
          label="Active subscribers"
          value={subscriberCount ?? 0}
          href="/dashboard/subscribers"
        />
        <StatCard
          icon={MousePointerClick}
          label="Clicks (30d)"
          value={clickCount ?? 0}
          href="/dashboard/pages"
        />
        <StatCard
          icon={FileText}
          label="Pages"
          value={pageCount ?? 0}
          href="/dashboard/pages"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your bio page</CardTitle>
          <CardDescription>
            {defaultPage?.is_published
              ? "Live and ready to share."
              : "Currently a draft. Publish it to make it public."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3 text-sm">
          {profile?.username ? (
            <>
              <Link
                href={`/${profile.username}`}
                target="_blank"
                className="text-foreground underline underline-offset-2"
              >
                /{profile.username}
              </Link>
              <span
                className={
                  defaultPage?.is_published
                    ? "bg-foreground text-background rounded-full px-2 py-0.5 text-xs"
                    : "bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs"
                }
              >
                {defaultPage?.is_published ? "Published" : "Draft"}
              </span>
              {defaultPage ? (
                <Link
                  href={`/dashboard/pages/${defaultPage.id}`}
                  className="text-muted-foreground hover:text-foreground ml-auto text-xs underline"
                >
                  Edit page →
                </Link>
              ) : null}
            </>
          ) : (
            <p className="text-muted-foreground">
              Set up your username in{" "}
              <Link
                href="/dashboard/settings"
                className="text-foreground underline"
              >
                Settings
              </Link>
              .
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="border-border bg-background hover:border-foreground/20 group flex flex-col gap-3 rounded-xl border p-5 transition-colors"
    >
      <div className="text-muted-foreground flex items-center gap-2 text-xs uppercase tracking-wide">
        <Icon className="size-4" />
        {label}
      </div>
      <div className="text-3xl font-semibold tabular-nums">
        {value.toLocaleString()}
      </div>
    </Link>
  );
}
