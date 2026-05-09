import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BarChart3 } from "lucide-react";
import { ViewtrackTabNav } from "@/components/dashboard/viewtrack/tab-nav";

export const metadata = { title: "Viewtrack — Contenomics" };
export const dynamic = "force-dynamic";

export default async function ViewtrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/viewtrack");

  return (
    <div className="mx-auto w-full max-w-6xl space-y-1 p-6">
      <header className="space-y-1.5">
        <div className="flex items-center gap-2">
          <BarChart3 className="text-muted-foreground size-5" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Video Performance Tracker
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl text-sm">
          Track video metadata, creative decisions, performance, and conversion
          data in one system.
        </p>
      </header>

      <ViewtrackTabNav />

      {children}
    </div>
  );
}
